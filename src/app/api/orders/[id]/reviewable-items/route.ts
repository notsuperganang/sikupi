import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// Route parameter validation
const OrderParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive')
})

// Helper function to get authenticated user
async function getAuthenticatedUser(request: NextRequest): Promise<{ user: any; error?: string }> {
  try {
    const headersList = await headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { user: null, error: 'No valid authorization header' }
    }
    
    const token = authorization.replace('Bearer ', '')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return { user: null, error: 'Invalid token' }
    }
    
    return { user }
    
  } catch (error) {
    console.error('Auth check error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = OrderParamsSchema.parse(resolvedParams)

    // Verify order ownership and completion status
    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        created_at,
        order_items!inner(
          id,
          product_id,
          product_title,
          price_idr,
          qty,
          unit,
          coffee_type,
          grind_level,
          condition,
          image_url
        )
      `)
      .eq('id', validatedParams.id)
      .eq('buyer_id', authResult.user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    const orderData = order as any

    // Check if order is completed
    if (orderData.status !== 'completed') {
      return NextResponse.json(
        { error: 'Order must be completed before reviews can be submitted' },
        { status: 400 }
      )
    }

    // Get existing reviews for this order's items
    const orderItemIds = orderData.order_items.map((item: any) => item.id)
    
    const { data: existingReviews, error: reviewsError } = await (supabaseAdmin as any)
      .from('product_reviews')
      .select('order_item_id, id, rating, comment, created_at')
      .in('order_item_id', orderItemIds)

    if (reviewsError) {
      console.error('Failed to fetch existing reviews:', reviewsError)
      return NextResponse.json(
        { error: 'Failed to check existing reviews' },
        { status: 500 }
      )
    }

    // Create a map of existing reviews by order_item_id
    const reviewsMap = new Map()
    ;(existingReviews || []).forEach((review: any) => {
      reviewsMap.set(review.order_item_id, review)
    })

    // Format order items with review status
    const reviewableItems = orderData.order_items.map((item: any) => {
      const existingReview = reviewsMap.get(item.id)
      
      return {
        order_item_id: item.id,
        product_id: item.product_id,
        product_title: item.product_title,
        price_idr: item.price_idr,
        quantity: parseFloat(item.qty),
        unit: item.unit,
        coffee_type: item.coffee_type,
        grind_level: item.grind_level,
        condition: item.condition,
        image_url: item.image_url,
        // Review status
        review_status: existingReview ? 'reviewed' : 'pending',
        existing_review: existingReview ? {
          review_id: existingReview.id,
          rating: existingReview.rating,
          comment: existingReview.comment,
          created_at: existingReview.created_at,
          can_edit: true // Reviews can typically be edited
        } : null
      }
    })

    // Calculate summary statistics
    const totalItems = reviewableItems.length
    const reviewedItems = reviewableItems.filter((item: any) => item.review_status === 'reviewed').length
    const pendingItems = totalItems - reviewedItems

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: orderData.id,
          status: orderData.status,
          completed_at: orderData.created_at, // You might want to add a specific completion timestamp
          total_items: totalItems
        },
        reviewable_items: reviewableItems,
        summary: {
          total_items: totalItems,
          reviewed_items: reviewedItems,
          pending_reviews: pendingItems,
          review_completion_rate: totalItems > 0 ? Math.round((reviewedItems / totalItems) * 100) : 0
        }
      }
    })

  } catch (error) {
    console.error('Get reviewable items API error:', error)
    
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
