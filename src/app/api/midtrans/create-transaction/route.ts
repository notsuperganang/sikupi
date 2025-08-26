import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { midtrans } from '@/lib/midtrans'
import { formatCurrency } from '@/lib/utils'

// Request validation schema
const CreateTransactionSchema = z.object({
  buyer_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.number().positive(),
    quantity: z.number().positive(),
    coffee_type: z.string().optional(),
    grind_level: z.string().optional(),
    condition: z.string().optional()
  })).min(1),
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
  courier_company: z.string().optional(),
  courier_service: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateTransactionSchema.parse(body)

    // Create order using stored procedure
    const { data: orderResult, error: orderError } = await (supabaseAdmin as any).rpc(
      'create_order_with_items',
      {
        p_buyer_id: validatedData.buyer_id,
        p_items: validatedData.items,
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

    if (!orderResult?.success) {
      return NextResponse.json(
        { error: 'Order creation failed', details: orderResult?.error },
        { status: 400 }
      )
    }

    const orderId = orderResult.order_id
    const totalAmount = orderResult.total_idr

    // Get order details for Midtrans
    const { data: orderDetails, error: detailsError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .single()

    if (detailsError || !orderDetails) {
      console.error('Failed to fetch order details:', detailsError)
      return NextResponse.json(
        { error: 'Failed to fetch order details' },
        { status: 500 }
      )
    }

    // Get buyer profile for customer details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', validatedData.buyer_id)
      .single()

    if (profileError || !profile) {
      console.error('Failed to fetch buyer profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch buyer profile' },
        { status: 500 }
      )
    }

    // Generate Midtrans order ID
    const midtransOrderId = midtrans.generateMidtransOrderId()

    // Prepare customer details
    const customerDetails = {
      first_name: (profile as any)?.full_name || validatedData.shipping_address.recipient_name,
      email: validatedData.shipping_address.email,
      phone: (profile as any)?.phone || validatedData.shipping_address.phone
    }

    // Prepare item details for Midtrans
    const itemDetails = (orderDetails as any).order_items.map((item: any) => {
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
    if (validatedData.shipping_fee_idr > 0) {
      itemDetails.push({
        id: 'shipping',
        name: `Ongkir - ${validatedData.courier_company} ${validatedData.courier_service}`,
        price: validatedData.shipping_fee_idr,
        quantity: 1
      })
    }

    // Create Midtrans transaction
    const snapResponse = await midtrans.createSnapToken({
      order_id: midtransOrderId,
      gross_amount: totalAmount,
      customer_details: customerDetails,
      item_details: itemDetails,
      shipping_address: validatedData.shipping_address,
      custom_field1: validatedData.buyer_id,
      custom_field2: orderId.toString()
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
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order with Midtrans details:', updateError)
      // Continue anyway, as the transaction was created successfully
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        midtrans_order_id: midtransOrderId,
        snap_token: snapResponse.token,
        redirect_url: snapResponse.redirect_url,
        total_amount: totalAmount,
        formatted_amount: formatCurrency(totalAmount),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    })

  } catch (error) {
    console.error('Create transaction error:', error)
    
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

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}