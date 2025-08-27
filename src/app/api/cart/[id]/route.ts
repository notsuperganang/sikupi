import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { CartStorage } from '@/lib/cart-storage'

// Update cart item validation schema
const UpdateCartItemSchema = z.object({
  quantity: z.number().positive().max(1000), // New quantity (not increment)
})

// Route parameter validation
const CartItemParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Product ID must be positive')
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
    const validatedParams = CartItemParamsSchema.parse(resolvedParams)
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateCartItemSchema.parse(body)
    
    // Check if item exists in cart
    const cartItem = CartStorage.getItem(authResult.user.id, validatedParams.id)
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      )
    }
    
    // Check stock availability for the new quantity
    if (validatedData.quantity > cartItem.product.stock_qty) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${cartItem.product.stock_qty} ${cartItem.product.unit}` },
        { status: 400 }
      )
    }
    
    // Update the quantity
    CartStorage.updateItemQuantity(authResult.user.id, validatedParams.id, validatedData.quantity)
    
    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        product_id: validatedParams.id,
        product_title: cartItem.product.title,
        previous_quantity: cartItem.quantity,
        new_quantity: validatedData.quantity,
      }
    })
    
  } catch (error) {
    console.error('Update cart item API error:', error)
    
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
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const validatedParams = CartItemParamsSchema.parse(resolvedParams)
    
    // Check if item exists in cart and remove it
    const cartItem = CartStorage.getItem(authResult.user.id, validatedParams.id)
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      )
    }
    
    // Remove the item from cart
    CartStorage.removeItem(authResult.user.id, validatedParams.id)
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        removed_product_id: validatedParams.id,
        removed_product_title: cartItem.product.title,
        removed_quantity: cartItem.quantity,
      }
    })
    
  } catch (error) {
    console.error('Remove cart item API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid product ID', 
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