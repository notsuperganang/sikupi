import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import type { Product } from '@/types/database'

// Query parameter validation schema
const ProductsQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1') || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '12') || 12, 100)), // Max 100 items per page
  search: z.string().optional(),
  category: z.enum(['ampas_kopi', 'briket', 'pulp', 'scrub', 'pupuk', 'pakan_ternak', 'lainnya']).optional(),
  kind: z.enum(['ampas', 'turunan']).optional(),
  coffee_type: z.enum(['arabika', 'robusta', 'mix', 'unknown']).optional(),
  grind_level: z.enum(['halus', 'sedang', 'kasar', 'unknown']).optional(),
  condition: z.enum(['basah', 'kering', 'unknown']).optional(),
  min_price: z.string().optional().transform(val => val ? parseInt(val) || 0 : undefined),
  max_price: z.string().optional().transform(val => val ? parseInt(val) || Number.MAX_SAFE_INTEGER : undefined),
  sort_by: z.enum(['created_at', 'price_idr', 'title', 'rating']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  published_only: z.string().optional().transform(val => val !== 'false').default('true'), // Default to published only
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    
    const validatedQuery = ProductsQuerySchema.parse(queryData)
    
    // Build Supabase query
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
    
    // Apply filters
    if (validatedQuery.published_only) {
      query = query.eq('published', true)
    }
    
    if (validatedQuery.search) {
      query = query.or(
        `title.ilike.%${validatedQuery.search}%,description.ilike.%${validatedQuery.search}%,sku.ilike.%${validatedQuery.search}%`
      )
    }
    
    if (validatedQuery.category) {
      query = query.eq('category', validatedQuery.category)
    }
    
    if (validatedQuery.kind) {
      query = query.eq('kind', validatedQuery.kind)
    }
    
    if (validatedQuery.coffee_type) {
      query = query.eq('coffee_type', validatedQuery.coffee_type)
    }
    
    if (validatedQuery.grind_level) {
      query = query.eq('grind_level', validatedQuery.grind_level)
    }
    
    if (validatedQuery.condition) {
      query = query.eq('condition', validatedQuery.condition)
    }
    
    if (validatedQuery.min_price !== undefined) {
      query = query.gte('price_idr', validatedQuery.min_price)
    }
    
    if (validatedQuery.max_price !== undefined && validatedQuery.max_price !== Number.MAX_SAFE_INTEGER) {
      query = query.lte('price_idr', validatedQuery.max_price)
    }
    
    // Apply sorting (handle rating sort differently)
    if (validatedQuery.sort_by === 'rating') {
      // For rating sort, we'll sort the results after fetching
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order(validatedQuery.sort_by, { ascending: validatedQuery.sort_order === 'asc' })
    }

    // Apply pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit
    query = query.range(offset, offset + validatedQuery.limit - 1)

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

    // Format products for frontend with rating information
    let formattedProducts = (products as any[]).map(product => {
      const ratingData = ratingsMap.get(product.id) || null

      return {
        id: product.id,
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
    })

    // Apply rating-based sorting if requested
    if (validatedQuery.sort_by === 'rating') {
      formattedProducts.sort((a, b) => {
        const aRating = a.rating_stats.avg_rating
        const bRating = b.rating_stats.avg_rating
        
        if (validatedQuery.sort_order === 'asc') {
          return aRating - bRating
        } else {
          return bRating - aRating
        }
      })
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedQuery.limit)
    const hasNextPage = validatedQuery.page < totalPages
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
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
        },
        filters_applied: {
          search: validatedQuery.search,
          category: validatedQuery.category,
          kind: validatedQuery.kind,
          coffee_type: validatedQuery.coffee_type,
          grind_level: validatedQuery.grind_level,
          condition: validatedQuery.condition,
          price_range: validatedQuery.min_price !== undefined || (validatedQuery.max_price !== undefined && validatedQuery.max_price !== Number.MAX_SAFE_INTEGER) ? {
            min: validatedQuery.min_price || 0,
            max: validatedQuery.max_price === Number.MAX_SAFE_INTEGER ? null : validatedQuery.max_price
          } : null,
          sort: {
            by: validatedQuery.sort_by,
            order: validatedQuery.sort_order
          },
          published_only: validatedQuery.published_only,
        }
      }
    })
    
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