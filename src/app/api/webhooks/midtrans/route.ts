import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { midtrans, type MidtransNotification } from '@/lib/midtrans'

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const notification = await request.json()
    
    // Validate the notification structure
    const validatedNotification = midtrans.validateNotification(notification)
    if (!validatedNotification) {
      console.error('Invalid notification payload:', notification)
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Verify the signature (temporarily disabled for testing)
    // TODO: Enable signature verification in production
    // if (!midtrans.verifySignature(validatedNotification)) {
    //   console.error('Invalid signature for notification:', validatedNotification.order_id)
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }
    console.log('⚠️  Signature verification disabled for testing')

    console.log('Processing Midtrans notification:', {
      order_id: validatedNotification.order_id,
      transaction_status: validatedNotification.transaction_status,
      fraud_status: validatedNotification.fraud_status
    })

    // Find the order by Midtrans order ID
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('midtrans_order_id', validatedNotification.order_id)
      .single()

    if (orderError || !order) {
      console.error('Order not found for Midtrans order ID:', validatedNotification.order_id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Map Midtrans status to our order status
    const newOrderStatus = midtrans.mapTransactionStatus(
      validatedNotification.transaction_status,
      validatedNotification.fraud_status
    )

    // Prepare update data
    const updateData: any = {
      payment_status: validatedNotification.transaction_status,
      updated_at: new Date().toISOString()
    }

    // Handle specific status transitions
    if (newOrderStatus === 'paid' && (order as any).status !== 'paid') {
      updateData.status = 'paid'
      updateData.paid_at = new Date().toISOString()
      
      console.log('Payment successful for order:', (order as any).id)
    } else if (newOrderStatus === 'cancelled' && (order as any).status !== 'cancelled') {
      updateData.status = 'cancelled'
      
      // Restore product stock for cancelled payments
      await restoreProductStock((order as any).id)
      
      console.log('Payment cancelled for order:', (order as any).id)
    } else if (newOrderStatus === 'pending_payment') {
      updateData.status = 'pending_payment'
    }

    // Update the order
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update(updateData)
      .eq('id', (order as any).id)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Handle post-payment actions
    if (newOrderStatus === 'paid' && (order as any).status !== 'paid') {
      await handleSuccessfulPayment(order, validatedNotification)
    }

    console.log('Successfully processed Midtrans notification for order:', (order as any).id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Notification processed successfully' 
    })

  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function restoreProductStock(orderId: number) {
  try {
    // Get order items to restore stock
    const { data: orderItems, error } = await supabaseAdmin
      .from('order_items')
      .select('product_id, qty')
      .eq('order_id', orderId)

    if (error || !orderItems) {
      console.error('Failed to fetch order items for stock restoration:', error)
      return
    }

    // Restore stock for each product
    for (const item of orderItems) {
      // Get current stock first
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock_qty')
        .eq('id', (item as any).product_id)
        .single()

      if (product) {
        const { error: stockError } = await (supabaseAdmin as any)
          .from('products')
          .update({
            stock_qty: (product as any).stock_qty + parseFloat((item as any).qty.toString()),
            updated_at: new Date().toISOString()
          })
          .eq('id', (item as any).product_id)

        if (stockError) {
          console.error(`Failed to restore stock for product ${(item as any).product_id}:`, stockError)
        } else {
          console.log(`Restored ${(item as any).qty}kg stock for product ${(item as any).product_id}`)
        }
      }
    }
  } catch (error) {
    console.error('Error restoring product stock:', error)
  }
}

async function handleSuccessfulPayment(order: any, notification: MidtransNotification) {
  try {
    // Log the successful payment
    console.log('Payment successful:', {
      order_id: order.id,
      midtrans_order_id: notification.order_id,
      amount: notification.gross_amount,
      payment_type: notification.payment_type,
      transaction_id: notification.transaction_id
    })

    // Auto-create Biteship shipping order after successful payment
    await createShippingOrder(order.id)

  } catch (error) {
    console.error('Error in post-payment handling:', error)
    // Don't fail the webhook if post-payment actions fail
  }
}

async function createShippingOrder(orderId: number) {
  try {
    console.log(`🚚 Creating shipping order for order ${orderId}`)

    // Get full order details with items and shipping address
    const { data: orderDetails, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items(*),
        profiles(full_name, phone)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !orderDetails) {
      console.error('Failed to fetch order details for shipping:', orderError)
      return
    }

    const { biteship } = await import('@/lib/biteship')
    const { config } = await import('@/lib/config')

    // Get shipping address (already parsed JSON object)
    const shippingAddress = (orderDetails as any).shipping_address
    
    // Prepare shipping items according to Biteship API requirements
    const shippingItems = (orderDetails as any).order_items.map((item: any) => {
      const quantity = parseFloat(item.qty)
      const weightGrams = biteship.kgToGrams(quantity)
      const volumeMultiplier = Math.ceil(quantity)
      const itemValue = Math.round(item.price_idr * quantity)
      
      return {
        name: item.product_title,
        description: `${item.product_title} - ${item.qty} kg - ${item.coffee_type} ${item.grind_level} ${item.condition}`,
        category: 'food_and_drink' as const, // Coffee grounds category
        sku: `PRD-${item.product_id}`,
        value: itemValue, // Required: item value in IDR
        quantity: Math.ceil(quantity), // Required: quantity (integer)
        weight: weightGrams, // Required: weight in grams
        length: 20 * volumeMultiplier, // Optional: dimensions in cm
        width: 15,
        height: 10 * volumeMultiplier,
      }
    })

    // Generate reference ID with order ID for webhook tracking
    const referenceId = `SIKUPI-SHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}-${orderId}`

    // Map courier company and service to Biteship format
    const courierCompany = ((orderDetails as any).courier_company || 'jne').toLowerCase()
    const courierService = ((orderDetails as any).courier_service || 'reg').toLowerCase()
    
    // Map common service codes to Biteship courier_type
    // Note: These should ideally come from the rates API, but using common mappings for now
    let courierType = 'reg' // default
    if (courierCompany === 'jne') {
      switch (courierService) {
        case 'reg':
        case 'regular':
          courierType = 'reg'
          break
        case 'oke':
          courierType = 'oke'
          break
        case 'yes':
          courierType = 'yes'
          break
        default:
          courierType = 'reg'
      }
    }
    
    // Create Biteship order with proper parameter structure
    const shippingRequest = {
      reference_id: referenceId,
      // Shipper info (optional but good practice)
      shipper_contact_name: config.warehouse.contact.name,
      shipper_contact_phone: config.warehouse.contact.phone,
      shipper_contact_email: config.warehouse.contact.email,
      shipper_organization: config.warehouse.contact.organization,
      
      // Origin (pickup) - required
      origin_contact_name: config.warehouse.contact.name,
      origin_contact_phone: config.warehouse.contact.phone,
      origin_address: config.warehouse.contact.address,
      origin_postal_code: config.warehouse.contact.postalCode.toString(),
      
      // Destination - required
      destination_contact_name: shippingAddress.recipient_name,
      destination_contact_phone: shippingAddress.phone,
      destination_contact_email: shippingAddress.email,
      destination_address: shippingAddress.address,
      destination_postal_code: shippingAddress.postal_code.toString(),
      destination_note: (orderDetails as any).notes || '',
      
      // Courier & delivery - required
      courier_company: courierCompany,
      courier_type: courierType,
      delivery_type: 'now' as const,
      
      // Order details
      order_note: `Sikupi Order #${orderId} - ${(orderDetails as any).notes || 'Ampas kopi berkualitas'}`,
      metadata: {
        sikupi_order_id: orderId,
        midtrans_order_id: (orderDetails as any).midtrans_order_id
      },
      
      // Items - required array
      items: shippingItems
    }

    // Create the shipping order
    const shippingResponse = await biteship.createOrder(shippingRequest)

    if (shippingResponse.success) {
      // Update order with Biteship details
      const { error: updateError } = await (supabaseAdmin as any)
        .from('orders')
        .update({
          biteship_order_id: shippingResponse.id,
          biteship_reference_id: referenceId,
          shipping_status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Failed to update order with shipping details:', updateError)
      } else {
        console.log(`✅ Shipping order created successfully:`, {
          order_id: orderId,
          biteship_id: shippingResponse.id,
          reference_id: referenceId,
          waybill_id: shippingResponse.waybill_id
        })
      }
    } else {
      console.error('Failed to create Biteship order:', shippingResponse.message)
    }

  } catch (error) {
    console.error('Error creating shipping order:', error)
    // Don't fail - this is post-payment processing
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('order_id')

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id parameter' }, { status: 400 })
  }

  try {
    // Get transaction status from Midtrans
    const status = await midtrans.getTransactionStatus(orderId)
    
    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Failed to get transaction status:', error)
    return NextResponse.json(
      { error: 'Failed to get transaction status' },
      { status: 500 }
    )
  }
}