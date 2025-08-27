import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import type { Product, ProductReview } from '@/types/database'

// Route parameter validation
const ProductParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Product ID must be positive')
})

// Query parameter validation
const ProductQuerySchema = z.object({
  include_reviews: z.string().optional().transform(val => val === 'true'),
  reviews_limit: z.string().optional().transform(val => Math.min(parseInt(val || '5'), 20)), // Max 20 reviews
  published_only: z.string().optional().transform(val => val !== 'false').default('true'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = ProductParamsSchema.parse(resolvedParams)
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    const validatedQuery = ProductQuerySchema.parse(queryData)
    
    // Get product details
    let productQuery = supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', validatedParams.id)
    
    // Apply published filter if requested
    if (validatedQuery.published_only) {
      productQuery = productQuery.eq('published', true)
    }
    
    const { data: product, error: productError } = await productQuery.single()
    
    if (productError) {
      if (productError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      console.error('Product query error:', productError)
      return NextResponse.json(
        { error: 'Failed to fetch product', details: productError.message },
        { status: 500 }
      )
    }
    
    // Format product data - Type assertion for TypeScript
    const productData = product as Product
    const formattedProduct = {
      id: productData.id,
      kind: productData.kind,
      category: productData.category,
      sku: productData.sku,
      title: productData.title,
      slug: productData.slug,
      description: productData.description,
      coffee_type: productData.coffee_type,
      grind_level: productData.grind_level,
      condition: productData.condition,
      price_idr: productData.price_idr,
      stock_qty: productData.stock_qty,
      unit: productData.unit,
      image_urls: productData.image_urls || [],
      published: productData.published,
      created_at: productData.created_at,
      updated_at: productData.updated_at,
    }
    
    // Optionally include reviews
    let reviews: any[] = []
    let reviewsSummary = null
    
    if (validatedQuery.include_reviews) {
      // Get reviews with user profile information
      const { data: reviewsData, error: reviewsError } = await supabaseAdmin
        .from('product_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          buyer_id,
          profiles!inner(full_name)
        `)
        .eq('product_id', validatedParams.id)
        .order('created_at', { ascending: false })
        .limit(validatedQuery.reviews_limit || 5)
      
      if (reviewsError) {
        console.error('Reviews query error:', reviewsError)
        // Don't fail the entire request for reviews error, just log it
      } else if (reviewsData && reviewsData.length > 0) {
        // Type assertion for reviews data
        const typedReviews = reviewsData as any[]
        
        reviews = typedReviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          buyer_name: review.profiles?.full_name || 'Anonymous',
        }))
        
        // Calculate reviews summary
        const totalReviews = typedReviews.length
        const averageRating = totalReviews > 0 
          ? typedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0
        
        // Get rating distribution
        const ratingDistribution = {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
        
        typedReviews.forEach(review => {
          ratingDistribution[review.rating as keyof typeof ratingDistribution]++
        })
        
        reviewsSummary = {
          total_reviews: totalReviews,
          average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          rating_distribution: ratingDistribution,
        }
      }
    }
    
    // Prepare response
    const responseData: any = {
      product: formattedProduct
    }
    
    if (validatedQuery.include_reviews) {
      responseData.reviews = reviews
      responseData.reviews_summary = reviewsSummary
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    })
    
  } catch (error) {
    console.error('Product detail API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
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