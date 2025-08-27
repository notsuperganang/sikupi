import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { midtrans } from '@/lib/midtrans'
import { formatCurrency } from '@/lib/utils'
import { NotificationHelpers } from '@/lib/notifications'

// Route parameter validation
const OrderParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive')
})

// Helper function to get authenticated user
async function getAuthenticatedUser(_request: NextRequest): Promise<{ user: any; error?: string }> {
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

    // Fetch order details and ensure it belongs to the user
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        subtotal_idr,
        shipping_fee_idr,
        total_idr,
        shipping_address,
        courier_company,
        courier_service,
        midtrans_order_id,
        midtrans_token,
        order_items(
          id,
          product_id,
          product_title,
          price_idr,
          qty,
          unit
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

    // Check if order is in valid state for checkout
    if (!['new', 'pending_payment'].includes(orderData.status)) {
      return NextResponse.json(
        { error: 'Order is not eligible for payment', details: `Current status: ${orderData.status}` },
        { status: 400 }
      )
    }

    // If there's already a valid Midtrans transaction, return existing token
    if (orderData.midtrans_order_id && orderData.midtrans_token) {
      return NextResponse.json({
        success: true,
        message: 'Payment token already exists',
        data: {
          order_id: orderData.id,
          midtrans_order_id: orderData.midtrans_order_id,
          snap_token: orderData.midtrans_token,
          redirect_url: `https://app.sandbox.midtrans.com/snap/v3/redirection/${orderData.midtrans_token}`,
          total_amount: orderData.total_idr,
          formatted_amount: formatCurrency(orderData.total_idr),
          existing_payment: true
        }
      })
    }

    // Get buyer profile for customer details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', authResult.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Failed to fetch buyer profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch buyer profile' },
        { status: 500 }
      )
    }

    // Generate Midtrans order ID if not exists
    const midtransOrderId = midtrans.generateMidtransOrderId()

    // Prepare customer details
    const shippingAddress = orderData.shipping_address
    const customerDetails = {
      first_name: (profile as any)?.full_name || shippingAddress.recipient_name,
      email: shippingAddress.email,
      phone: (profile as any)?.phone || shippingAddress.phone
    }

    // Prepare item details for Midtrans
    const itemDetails = orderData.order_items.map((item: any) => {
      const originalQty = parseFloat(item.qty)
      const pricePerUnit = parseInt(item.price_idr)
      const totalItemPrice = pricePerUnit * originalQty
      
      // For fractional quantities, use quantity 1 with total price
      // For whole numbers, use the actual quantity and unit price
      if (originalQty % 1 === 0) {
        // Whole number quantity
        return {
          id: item.product_id,
          name: item.product_title,
          price: pricePerUnit,
          quantity: Math.floor(originalQty)
        }
      } else {
        // Fractional quantity - use single item with total price
        return {
          id: item.product_id,
          name: `${item.product_title} (${originalQty} kg)`,
          price: Math.round(totalItemPrice),
          quantity: 1
        }
      }
    })

    // Add shipping fee as separate item if applicable
    if (orderData.shipping_fee_idr > 0) {
      itemDetails.push({
        id: 'shipping',
        name: `Ongkir - ${orderData.courier_company} ${orderData.courier_service}`,
        price: orderData.shipping_fee_idr,
        quantity: 1
      })
    }

    // Create Midtrans transaction
    const snapResponse = await midtrans.createSnapToken({
      order_id: midtransOrderId,
      gross_amount: orderData.total_idr,
      customer_details: customerDetails,
      item_details: itemDetails,
      shipping_address: shippingAddress,
      custom_field1: authResult.user.id,
      custom_field2: orderData.id.toString()
    })

    // Update order with Midtrans details
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update({
        midtrans_order_id: midtransOrderId,
        midtrans_token: snapResponse.token,
        status: 'pending_payment',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderData.id)

    if (updateError) {
      console.error('Failed to update order with Midtrans details:', updateError)
      // Continue anyway, as the transaction was created successfully
    }

    // Send order creation notification to customer
    try {
      await NotificationHelpers.orderCreated(
        authResult.user.id,
        orderData.id,
        orderData.total_idr
      )
      console.log('🔔 Order creation notification sent for order:', orderData.id)
    } catch (notificationError) {
      console.error('Failed to send order creation notification:', notificationError)
      // Don't fail checkout for notification errors
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Payment token created successfully',
      data: {
        order_id: orderData.id,
        midtrans_order_id: midtransOrderId,
        snap_token: snapResponse.token,
        redirect_url: snapResponse.redirect_url,
        total_amount: orderData.total_idr,
        formatted_amount: formatCurrency(orderData.total_idr),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        existing_payment: false
      }
    })

  } catch (error) {
    console.error('Checkout API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid order ID', 
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