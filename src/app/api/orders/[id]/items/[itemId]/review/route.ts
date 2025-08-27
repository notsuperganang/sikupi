import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// Review submission validation schema
const ReviewSubmissionSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
})

// Route parameter validation
const ReviewParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive'),
  itemId: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Item ID must be positive')
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
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
    const validatedParams = ReviewParamsSchema.parse(resolvedParams)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = ReviewSubmissionSchema.parse(body)

    // Verify order ownership and completion
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        order_items!inner(
          id,
          product_id,
          product_title
        )
      `)
      .eq('id', validatedParams.id)
      .eq('buyer_id', authResult.user.id)
      .eq('order_items.id', validatedParams.itemId)
      .eq('status', 'completed')
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found, not completed, or item not found in order' },
        { status: 404 }
      )
    }

    const orderData = order as any
    const orderItem = orderData.order_items[0]

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      )
    }

    // Check if review already exists for this order item
    const { data: existingReview, error: reviewCheckError } = await supabaseAdmin
      .from('product_reviews')
      .select('id')
      .eq('order_item_id', validatedParams.itemId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this purchase. You can update your existing review instead.' },
        { status: 409 }
      )
    }

    // Create the review
    const { data: newReview, error: createError } = await (supabaseAdmin as any)
      .from('product_reviews')
      .insert({
        product_id: orderItem.product_id,
        order_item_id: validatedParams.itemId,
        buyer_id: authResult.user.id,
        rating: validatedData.rating,
        comment: validatedData.comment || null
      })
      .select('*')
      .single()

    if (createError || !newReview) {
      console.error('Failed to create review:', createError)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review_id: (newReview as any).id,
        product_id: orderItem.product_id,
        product_title: orderItem.product_title,
        rating: validatedData.rating,
        comment: validatedData.comment,
        created_at: (newReview as any).created_at,
        can_edit: true // Reviews can be edited
      }
    })

  } catch (error) {
    console.error('Review submission API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
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
