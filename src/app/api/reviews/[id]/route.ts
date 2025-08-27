import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

// Review update validation schema
const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(1000).optional(),
}).refine(data => data.rating !== undefined || data.comment !== undefined, {
  message: "At least one field (rating or comment) must be provided"
})

// Route parameter validation
const ReviewParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Review ID must be positive')
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

// Helper function to check admin permissions
async function checkAdminPermissions(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return { isAdmin: false, error: authResult.error }
    }
    
    // Check user's role in profiles table
    const { data: profile, error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .select('role')
      .eq('id', authResult.user.id)
      .single()
    
    if (profileError || !profile) {
      return { isAdmin: false, error: 'User profile not found' }
    }
    
    const userProfile = profile as any
    if (userProfile.role !== 'admin') {
      return { isAdmin: false, error: 'Insufficient permissions' }
    }
    
    return { isAdmin: true, userId: authResult.user.id }
    
  } catch (error) {
    console.error('Admin permission check error:', error)
    return { isAdmin: false, error: 'Permission check failed' }
  }
}

export async function PUT(
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
    const validatedParams = ReviewParamsSchema.parse(resolvedParams)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateReviewSchema.parse(body)

    // Check if review exists and get ownership info
    const { data: review, error: reviewError } = await (supabaseAdmin as any)
      .from('product_reviews')
      .select(`
        id,
        buyer_id,
        product_id,
        rating,
        comment,
        created_at,
        order_items!inner(
          order_id,
          product_title
        )
      `)
      .eq('id', validatedParams.id)
      .single()

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const reviewData = review as any

    // Check ownership (user can only edit their own reviews)
    if (reviewData.buyer_id !== authResult.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      )
    }

    // Optional: Check if review is still editable (e.g., within 48 hours)
    const reviewAge = Date.now() - new Date(reviewData.created_at).getTime()
    const maxEditTime = 48 * 60 * 60 * 1000 // 48 hours in milliseconds
    
    if (reviewAge > maxEditTime) {
      return NextResponse.json(
        { error: 'Review can no longer be edited (48 hour limit exceeded)' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.rating !== undefined) {
      updateData.rating = validatedData.rating
    }
    if (validatedData.comment !== undefined) {
      updateData.comment = validatedData.comment
    }

    // Update the review
    const { data: updatedReview, error: updateError } = await (supabaseAdmin as any)
      .from('product_reviews')
      .update(updateData)
      .eq('id', validatedParams.id)
      .select('*')
      .single()

    if (updateError || !updatedReview) {
      console.error('Failed to update review:', updateError)
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review_id: (updatedReview as any).id,
        product_id: reviewData.product_id,
        product_title: reviewData.order_items?.product_title,
        rating: (updatedReview as any).rating,
        comment: (updatedReview as any).comment,
        created_at: (updatedReview as any).created_at,
        updated: true
      }
    })

  } catch (error) {
    console.error('Update review API error:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = ReviewParamsSchema.parse(resolvedParams)

    // Check if user is admin or the review owner
    const authResult = await getAuthenticatedUser(request)
    const adminCheck = await checkAdminPermissions(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get review details
    const { data: review, error: reviewError } = await (supabaseAdmin as any)
      .from('product_reviews')
      .select(`
        id,
        buyer_id,
        product_id,
        rating,
        comment,
        order_items!inner(
          product_title
        )
      `)
      .eq('id', validatedParams.id)
      .single()

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const reviewData = review as any

    // Check permissions: user can delete their own review, admin can delete any review
    const canDelete = adminCheck.isAdmin || reviewData.buyer_id === authResult.user.id

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      )
    }

    // Delete the review
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('product_reviews')
      .delete()
      .eq('id', validatedParams.id)

    if (deleteError) {
      console.error('Failed to delete review:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        deleted_review_id: validatedParams.id,
        product_id: reviewData.product_id,
        product_title: reviewData.order_items?.product_title,
        deleted_by: adminCheck.isAdmin ? 'admin' : 'user'
      }
    })

  } catch (error) {
    console.error('Delete review API error:', error)
    
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
