import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { CartStorage } from '@/lib/cart-storage-db'

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
    
    // Get user's cart items from database
    const cartItems = await CartStorage.getCartItems(authResult.user.id)
    const summary = await CartStorage.getCartSummary(authResult.user.id)
    
    // Format cart items for response
    const formattedItems = cartItems.map(item => ({
      product_id: item.product_id,
      product: {
        id: item.product_id,
        title: item.product_title,
        price_idr: item.price_idr,
        image_urls: item.image_urls || [],
        coffee_type: item.coffee_type,
        grind_level: item.grind_level,
        condition: item.condition,
        unit: item.unit,
        stock_qty: item.stock_qty,
        published: true, // Only published products in cart
      },
      quantity: item.quantity,
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        cart_items: formattedItems,
        summary
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