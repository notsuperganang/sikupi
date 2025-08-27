import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'

// Query parameter validation schema
const ReviewsQuerySchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1') || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val || '10') || 10, 50)), // Max 50 reviews per page
  sort: z.enum(['newest', 'oldest', 'rating_high', 'rating_low']).default('newest'),
  rating_filter: z.string().optional().transform(val => val ? parseInt(val) : undefined).refine(val => val === undefined || (val >= 1 && val <= 5), 'Rating filter must be 1-5')
})

// Route parameter validation
const ProductParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Product ID must be positive')
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
    const queryParams: Record<string, string> = {}
    
    if (searchParams.get('page')) queryParams.page = searchParams.get('page')!
    if (searchParams.get('limit')) queryParams.limit = searchParams.get('limit')!
    if (searchParams.get('sort')) queryParams.sort = searchParams.get('sort')!
    if (searchParams.get('rating_filter')) queryParams.rating_filter = searchParams.get('rating_filter')!
    
    const validatedQuery = ReviewsQuerySchema.parse(queryParams)

    // First, verify product exists and is published
    const { data: product, error: productError } = await (supabaseAdmin as any)
      .from('products')
      .select('id, title, published')
      .eq('id', validatedParams.id)
      .eq('published', true)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or not published' },
        { status: 404 }
      )
    }

    // Build the reviews query with joins to get buyer info
    let reviewsQuery = (supabaseAdmin as any)
      .from('product_reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles!inner(full_name)
      `)
      .eq('product_id', validatedParams.id)

    // Apply rating filter if specified
    if (validatedQuery.rating_filter !== undefined) {
      reviewsQuery = reviewsQuery.eq('rating', validatedQuery.rating_filter)
    }

    // Apply sorting
    switch (validatedQuery.sort) {
      case 'newest':
        reviewsQuery = reviewsQuery.order('created_at', { ascending: false })
        break
      case 'oldest':
        reviewsQuery = reviewsQuery.order('created_at', { ascending: true })
        break
      case 'rating_high':
        reviewsQuery = reviewsQuery.order('rating', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'rating_low':
        reviewsQuery = reviewsQuery.order('rating', { ascending: true }).order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    const from = (validatedQuery.page - 1) * validatedQuery.limit
    const to = from + validatedQuery.limit - 1
    reviewsQuery = reviewsQuery.range(from, to)

    // Execute reviews query
    const { data: reviews, error: reviewsError, count } = await reviewsQuery

    if (reviewsError) {
      console.error('Failed to fetch reviews:', reviewsError)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    // Get rating statistics for the product
    const { data: ratingStats, error: statsError } = await (supabaseAdmin as any)
      .from('product_reviews')
      .select('rating')
      .eq('product_id', validatedParams.id)

    if (statsError) {
      console.error('Failed to fetch rating stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch rating statistics' },
        { status: 500 }
      )
    }

    // Calculate rating statistics
    const totalReviews = ratingStats?.length || 0
    const avgRating = totalReviews > 0 
      ? Math.round((ratingStats.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0

    const ratingBreakdown = {
      5: ratingStats?.filter((r: any) => r.rating === 5).length || 0,
      4: ratingStats?.filter((r: any) => r.rating === 4).length || 0,
      3: ratingStats?.filter((r: any) => r.rating === 3).length || 0,
      2: ratingStats?.filter((r: any) => r.rating === 2).length || 0,
      1: ratingStats?.filter((r: any) => r.rating === 1).length || 0,
    }

    // Format reviews for response (mask buyer names for privacy)
    const formattedReviews = (reviews || []).map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      buyer_name: maskBuyerName(review.profiles?.full_name),
      created_at: review.created_at,
      is_verified: true // All reviews are verified purchases
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validatedQuery.limit)
    const hasNextPage = validatedQuery.page < totalPages
    const hasPrevPage = validatedQuery.page > 1

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          title: product.title
        },
        reviews: formattedReviews,
        stats: {
          total_reviews: totalReviews,
          avg_rating: avgRating,
          rating_breakdown: ratingBreakdown
        },
        pagination: {
          current_page: validatedQuery.page,
          per_page: validatedQuery.limit,
          total_items: count || 0,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage
        },
        filters_applied: {
          sort: validatedQuery.sort,
          rating_filter: validatedQuery.rating_filter
        }
      }
    })

  } catch (error) {
    console.error('Get reviews API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to mask buyer names for privacy
function maskBuyerName(fullName: string | null): string {
  if (!fullName || fullName.length === 0) {
    return 'Anonymous'
  }
  
  const names = fullName.trim().split(' ')
  if (names.length === 1) {
    // Single name: show first letter + stars
    return names[0].charAt(0).toUpperCase() + '*'.repeat(Math.max(1, names[0].length - 1))
  } else {
    // Multiple names: show first name + last initial
    const firstName = names[0]
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  }
}
