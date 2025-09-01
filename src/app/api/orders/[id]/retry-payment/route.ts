import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { midtrans } from '@/lib/midtrans'
import { formatCurrency } from '@/lib/utils'

export async function POST(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Parse orderId from params
    const orderId = params.id
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get auth user info (we allow both admin and order owner to retry payment)
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authorization' }, { status: 401 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Cast order to any to handle complex joined data structure
    const orderData = order as any

    // Check if user owns this order or is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (orderData.buyer_id !== user.id && (profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if order can be paid
    if (orderData.status !== 'pending_payment' && orderData.status !== 'new') {
      return NextResponse.json(
        { error: 'Order cannot be paid', details: `Order status is ${orderData.status}` }, 
        { status: 400 }
      )
    }

    // Get buyer profile for customer details
    const { data: buyerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', orderData.buyer_id)
      .single()

    if (profileError || !buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Generate new Midtrans order ID for retry
    const newMidtransOrderId = midtrans.generateMidtransOrderId()

    // Prepare customer details
    const customerDetails = {
      first_name: (buyerProfile as any)?.full_name || orderData.shipping_address.recipient_name,
      email: orderData.shipping_address.email,
      phone: (buyerProfile as any)?.phone || orderData.shipping_address.phone
    }

    // Prepare item details for Midtrans
    const itemDetails = orderData.order_items.map((item: any) => {
      const originalQty = parseFloat(item.qty)
      const pricePerUnit = parseInt(item.price_idr)
      const totalItemPrice = pricePerUnit * originalQty
      
      // For fractional quantities, use quantity 1 with total price
      if (originalQty % 1 === 0) {
        return {
          id: item.product_id,
          name: item.product_title,
          price: pricePerUnit,
          quantity: Math.floor(originalQty)
        }
      } else {
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

    // Create new Midtrans Snap token
    const snapResponse = await midtrans.createSnapToken({
      order_id: newMidtransOrderId,
      gross_amount: orderData.total_idr,
      customer_details: customerDetails,
      item_details: itemDetails,
      shipping_address: orderData.shipping_address,
      custom_field1: orderData.buyer_id,
      custom_field2: orderId
    })

    // Update order with new Midtrans details
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update({
        midtrans_order_id: newMidtransOrderId,
        midtrans_token: snapResponse.token,
        status: 'pending_payment',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order with new Midtrans details:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order', details: updateError.message },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        order_id: parseInt(orderId),
        midtrans_order_id: newMidtransOrderId,
        snap_token: snapResponse.token,
        redirect_url: snapResponse.redirect_url,
        total_amount: orderData.total_idr,
        formatted_amount: formatCurrency(orderData.total_idr),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Retry payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}