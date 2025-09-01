import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import type { Product } from '@/types/database'
import { transformProduct, parseCursor, generateCursor, mapSort } from '@/lib/products'

// Query parameter validation schema
const ProductsQuerySchema = z.object({
  // Legacy page-based pagination (maintained for backward compatibility)
  page: z.string().optional().transform(val => parseInt(val || '1') || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '24') || 24, 48)), // Max 48 items per page
  
  // New cursor-based pagination
  cursor: z.string().optional(),
  
  // Search and filters
  q: z.string().optional(), // Changed from 'search' to match frontend
  category: z.enum(['ampas_kopi', 'briket', 'pulp', 'scrub', 'pupuk', 'pakan_ternak', 'lainnya']).optional(),
  kind: z.enum(['ampas', 'turunan']).optional(),
  coffeeType: z.enum(['arabika', 'robusta', 'mix', 'unknown']).optional(), // Changed from coffee_type
  grindLevel: z.enum(['halus', 'sedang', 'kasar', 'unknown']).optional(), // Changed from grind_level
  condition: z.enum(['basah', 'kering', 'unknown']).optional(),
  minPrice: z.string().optional().transform(val => val ? parseInt(val) || 0 : undefined), // Changed from min_price
  maxPrice: z.string().optional().transform(val => val ? parseInt(val) || Number.MAX_SAFE_INTEGER : undefined), // Changed from max_price
  
  // Sorting (simplified to match frontend expectations)
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'title', 'rating']).default('newest'),
  
  published_only: z.string().optional().transform(val => val !== 'false').default('true'),
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = ProductsQuerySchema.parse(queryData)
    
    // Map sort to database columns
    const sortConfig = mapSort(validatedQuery.sort)
    const useCursorPagination = !!validatedQuery.cursor
    
    // Build Supabase query
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: useCursorPagination ? undefined : 'exact' }) // Only count for page-based pagination
    
    // Apply filters
    if (validatedQuery.published_only) {
      query = query.eq('published', true)
    }
    
    if (validatedQuery.q) {
      query = query.ilike('title', `%${validatedQuery.q}%`)
    }
    
    if (validatedQuery.category) {
      query = query.eq('category', validatedQuery.category)
    }
    
    if (validatedQuery.kind) {
      query = query.eq('kind', validatedQuery.kind)
    }
    
    if (validatedQuery.coffeeType) {
      query = query.eq('coffee_type', validatedQuery.coffeeType)
    }
    
    if (validatedQuery.grindLevel) {
      query = query.eq('grind_level', validatedQuery.grindLevel)
    }
    
    if (validatedQuery.condition) {
      query = query.eq('condition', validatedQuery.condition)
    }
    
    if (validatedQuery.minPrice !== undefined) {
      query = query.gte('price_idr', validatedQuery.minPrice)
    }
    
    if (validatedQuery.maxPrice !== undefined && validatedQuery.maxPrice !== Number.MAX_SAFE_INTEGER) {
      query = query.lte('price_idr', validatedQuery.maxPrice)
    }
    
    // Apply cursor-based filtering if cursor provided
    if (useCursorPagination && validatedQuery.cursor) {
      const cursorData = parseCursor(validatedQuery.cursor)
      if (cursorData && sortConfig.column !== 'rating') {
        const operator = sortConfig.dir === 'asc' ? 'gt' : 'lt'
        
        if (sortConfig.column === 'created_at') {
          query = query[operator]('created_at', cursorData.value)
        } else if (sortConfig.column === 'price_idr') {
          query = query[operator]('price_idr', parseInt(cursorData.value))
        } else if (sortConfig.column === 'title') {
          query = query[operator]('title', cursorData.value)
        }
        
        // Always add ID as tiebreaker for consistent pagination
        query = query.gt('id', parseInt(cursorData.id))
      }
    }
    
    // Apply sorting (handle rating sort differently)
    if (validatedQuery.sort === 'rating') {
      // For rating sort, we'll sort the results after fetching with rating data
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order(sortConfig.column, { ascending: sortConfig.dir === 'asc' })
      query = query.order('id', { ascending: true }) // Secondary sort for consistency
    }

    // Apply pagination
    if (useCursorPagination) {
      // Cursor-based: fetch limit + 1 to check for next page
      query = query.limit(validatedQuery.limit + 1)
    } else {
      // Page-based: traditional offset pagination
      const offset = (validatedQuery.page - 1) * validatedQuery.limit
      query = query.range(offset, offset + validatedQuery.limit - 1)
    }

    // Execute query
    const { data: products, error, count } = await query
    
    if (error) {
      console.error('Products query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      )
    }

    // Fetch rating data for these products
    let ratingsMap = new Map()
    if (products && products.length > 0) {
      const productIds = (products as any[]).map(p => p.id)
      const { data: ratingsData, error: ratingsError } = await (supabaseAdmin as any)
        .from('product_rating_summary')
        .select('*')
        .in('product_id', productIds)
      
      if (!ratingsError && ratingsData) {
        (ratingsData as any[]).forEach(rating => {
          ratingsMap.set(rating.product_id, rating)
        })
      }
    }

    // Handle cursor pagination
    let hasNextPage = false
    let actualProducts = products as any[]
    
    if (useCursorPagination && actualProducts.length > validatedQuery.limit) {
      hasNextPage = true
      actualProducts = actualProducts.slice(0, validatedQuery.limit) // Remove the extra item
    }

    // Format products for frontend with rating information
    let formattedProducts = actualProducts.map(product => {
      const ratingData = ratingsMap.get(product.id) || null

      // Transform to match frontend Product type
      const transformedProduct = {
        id: product.id.toString(),
        kind: product.kind,
        category: product.category,
        sku: product.sku,
        title: product.title,
        slug: product.slug,
        description: product.description,
        coffee_type: product.coffee_type,
        grind_level: product.grind_level,
        condition: product.condition,
        price_idr: product.price_idr,
        stock_qty: product.stock_qty,
        unit: product.unit,
        image_urls: product.image_urls || [],
        published: product.published,
        created_at: product.created_at,
        updated_at: product.updated_at,
        // Rating information
        rating_stats: ratingData ? {
          total_reviews: ratingData.total_reviews || 0,
          avg_rating: ratingData.avg_rating || 0,
          rating_breakdown: {
            5: ratingData.five_stars || 0,
            4: ratingData.four_stars || 0,
            3: ratingData.three_stars || 0,
            2: ratingData.two_stars || 0,
            1: ratingData.one_star || 0
          }
        } : {
          total_reviews: 0,
          avg_rating: 0,
          rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }

      return transformedProduct
    })

    // Apply rating-based sorting if requested
    if (validatedQuery.sort === 'rating') {
      formattedProducts.sort((a, b) => {
        const aRating = a.rating_stats.avg_rating
        const bRating = b.rating_stats.avg_rating
        
        return sortConfig.dir === 'asc' ? aRating - bRating : bRating - aRating
      })
    }

    // Generate next cursor if needed
    let nextCursor: string | undefined
    if (useCursorPagination && hasNextPage && formattedProducts.length > 0) {
      const lastProduct = actualProducts[actualProducts.length - 1]
      nextCursor = generateCursor(lastProduct, sortConfig.column)
    }

    // Prepare response based on pagination type
    if (useCursorPagination) {
      // Cursor-based response (simplified for frontend)
      return NextResponse.json({
        success: true,
        data: {
          products: formattedProducts,
          pagination: {
            next_cursor: nextCursor,
            has_next_page: hasNextPage,
            per_page: validatedQuery.limit,
          },
          filters_applied: {
            q: validatedQuery.q,
            category: validatedQuery.category,
            kind: validatedQuery.kind,
            coffeeType: validatedQuery.coffeeType,
            grindLevel: validatedQuery.grindLevel,
            condition: validatedQuery.condition,
            price_range: validatedQuery.minPrice !== undefined || (validatedQuery.maxPrice !== undefined && validatedQuery.maxPrice !== Number.MAX_SAFE_INTEGER) ? {
              min: validatedQuery.minPrice || 0,
              max: validatedQuery.maxPrice === Number.MAX_SAFE_INTEGER ? null : validatedQuery.maxPrice
            } : null,
            sort: validatedQuery.sort,
            published_only: validatedQuery.published_only,
          }
        }
      })
    } else {
      // Page-based response (legacy format maintained)
      const totalPages = Math.ceil((count || 0) / validatedQuery.limit)
      const hasNextPageLegacy = validatedQuery.page < totalPages
      const hasPrevPage = validatedQuery.page > 1
      
      return NextResponse.json({
        success: true,
        data: {
          products: formattedProducts,
          pagination: {
            current_page: validatedQuery.page,
            per_page: validatedQuery.limit,
            total_items: count || 0,
            total_pages: totalPages,
            has_next_page: hasNextPageLegacy,
            has_prev_page: hasPrevPage,
          },
          filters_applied: {
            q: validatedQuery.q,
            category: validatedQuery.category,
            kind: validatedQuery.kind,
            coffeeType: validatedQuery.coffeeType,
            grindLevel: validatedQuery.grindLevel,
            condition: validatedQuery.condition,
            price_range: validatedQuery.minPrice !== undefined || (validatedQuery.maxPrice !== undefined && validatedQuery.maxPrice !== Number.MAX_SAFE_INTEGER) ? {
              min: validatedQuery.minPrice || 0,
              max: validatedQuery.maxPrice === Number.MAX_SAFE_INTEGER ? null : validatedQuery.maxPrice
            } : null,
            sort: validatedQuery.sort,
            published_only: validatedQuery.published_only,
          }
        }
      })
    }
    
  } catch (error) {
    console.error('Products API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}