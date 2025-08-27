import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { CartStorage } from '@/lib/cart-storage-db'
import type { OrderStatus } from '@/types/database'

// Create order validation schema
const CreateOrderSchema = z.object({
  shipping_address: z.object({
    recipient_name: z.string().min(1),
    phone: z.string().min(8),
    email: z.string().email(),
    address: z.string().min(10),
    city: z.string().min(1),
    postal_code: z.string().min(5),
    area_id: z.string().min(1)
  }),
  shipping_fee_idr: z.number().nonnegative(),
  courier_company: z.string().min(1),
  courier_service: z.string().min(1),
  notes: z.string().optional()
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

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateOrderSchema.parse(body)

    // Get user's cart items from database
    const cartItems = await CartStorage.getCartItems(authResult.user.id)
    
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty. Add items to cart before creating an order.' },
        { status: 400 }
      )
    }

    // Validate cart before creating order
    const validation = await CartStorage.validateCart(authResult.user.id)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Cart validation failed',
          issues: validation.issues
        },
        { status: 400 }
      )
    }

    // Prepare items for order creation
    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      coffee_type: item.coffee_type,
      grind_level: item.grind_level,
      condition: item.condition
    }))

    // Create order using the existing stored procedure
    const { data: orderResult, error: orderError } = await (supabaseAdmin as any).rpc(
      'create_order_with_items',
      {
        p_buyer_id: authResult.user.id,
        p_items: orderItems,
        p_shipping_address: validatedData.shipping_address,
        p_shipping_fee_idr: validatedData.shipping_fee_idr,
        p_courier_company: validatedData.courier_company,
        p_courier_service: validatedData.courier_service,
        p_notes: validatedData.notes
      }
    )

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 400 }
      )
    }

    const result = orderResult as { success: boolean; order_id?: number; total_idr?: number; error?: string }
    
    if (!result?.success) {
      return NextResponse.json(
        { error: 'Order creation failed', details: result?.error },
        { status: 400 }
      )
    }

    // Clear the user's cart after successful order creation
    const clearResult = await CartStorage.clearCart(authResult.user.id)
    if (!clearResult.success) {
      console.error('Failed to clear cart after order creation:', clearResult.error)
      // Continue anyway since order was created successfully
    }

    // Return the created order details
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: result.order_id,
        total_idr: result.total_idr,
        status: 'new',
        items_count: orderItems.length,
        next_step: 'payment',
        payment_url: `/checkout/payment?order_id=${result.order_id}`
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create order API error:', error)
    
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status') as OrderStatus | null
    
    // Build query
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        subtotal_idr,
        shipping_fee_idr,
        total_idr,
        courier_company,
        courier_service,
        payment_status,
        paid_at,
        created_at,
        updated_at,
        order_items(
          id,
          product_title,
          price_idr,
          qty,
          unit
        )
      `)
      .eq('buyer_id', authResult.user.id)
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: orders, error: ordersError, count } = await query

    if (ordersError) {
      console.error('Failed to fetch orders:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const { data: orderStats } = await supabaseAdmin
      .from('orders')
      .select('status, total_idr')
      .eq('buyer_id', authResult.user.id)

    const summary = {
      total_orders: orderStats?.length || 0,
      total_spent_idr: orderStats?.reduce((sum: number, order: any) => sum + (order.total_idr || 0), 0) || 0,
      orders_by_status: orderStats?.reduce((acc: Record<string, number>, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
    }

    return NextResponse.json({
      success: true,
      data: {
        orders: orders || [],
        pagination: {
          page,
          limit,
          total_count: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
          has_next: (count || 0) > page * limit,
          has_previous: page > 1
        },
        summary
      }
    })

  } catch (error) {
    console.error('List orders API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}