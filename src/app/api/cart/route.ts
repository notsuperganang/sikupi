import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { CartStorage } from '@/lib/cart-storage'

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


export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's cart items
    const cartItems = CartStorage.getCartItems(authResult.user.id).map(({ productId, item }) => ({
      product_id: productId,
      product: {
        id: item.product.id,
        title: item.product.title,
        price_idr: item.product.price_idr,
        image_urls: item.product.image_urls || [],
        coffee_type: item.product.coffee_type,
        grind_level: item.product.grind_level,
        condition: item.product.condition,
        unit: item.product.unit,
        stock_qty: item.product.stock_qty,
        published: item.product.published,
      },
      quantity: item.quantity,
    }))
    
    // Calculate totals
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price_idr * item.quantity), 0)
    
    return NextResponse.json({
      success: true,
      data: {
        cart_items: cartItems,
        summary: {
          total_items: totalItems,
          total_amount_idr: totalAmount,
          items_count: cartItems.length
        }
      }
    })
    
  } catch (error) {
    console.error('Cart API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}