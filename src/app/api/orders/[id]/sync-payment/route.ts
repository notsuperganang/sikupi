import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { biteship } from '@/lib/biteship'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const orderId = parseInt(resolvedParams.id)
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    console.log(`🔄 [SYNC_PAYMENT] Starting payment sync for order ${orderId}`)

    // Fetch current order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles (*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('❌ [SYNC_PAYMENT] Order not found:', orderError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Cast to any to avoid TypeScript issues
    const orderData = order as any

    console.log(`📦 [SYNC_PAYMENT] Current order status: ${orderData.status}`)

    let paymentUpdated = false
    let shipmentCreated = false
    let updatedOrder = { ...orderData }

    // Check payment status with Midtrans if we have a transaction ID
    if (orderData.payment_transaction_id && orderData.payment_provider === 'midtrans') {
      console.log(`💳 [SYNC_PAYMENT] Checking Midtrans status for transaction: ${orderData.payment_transaction_id}`)
      
      try {
        const midtransResponse = await fetch(
          `https://api.sandbox.midtrans.com/v2/${orderData.payment_transaction_id}/status`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`
            }
          }
        )

        if (midtransResponse.ok) {
          const midtransData = await midtransResponse.json()
          console.log(`💳 [SYNC_PAYMENT] Midtrans response:`, midtransData)

          const newPaymentStatus = midtransData.transaction_status
          const currentPaidAt = orderData.paid_at
          let newPaidAt = currentPaidAt

          // Update payment status and paid_at if payment is settled
          if (['settlement', 'capture'].includes(newPaymentStatus) && !currentPaidAt) {
            newPaidAt = new Date().toISOString()
            paymentUpdated = true
            console.log(`✅ [SYNC_PAYMENT] Payment confirmed, setting paid_at: ${newPaidAt}`)
          }

          // Update order with payment information
          const { data: updatedOrderData, error: updateError } = await (supabaseAdmin as any)
            .from('orders')
            .update({
              payment_status: newPaymentStatus,
              payment_method: midtransData.payment_type,
              paid_at: newPaidAt,
              status: newPaidAt ? 'paid' : orderData.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select('*')
            .single()

          if (updateError) {
            console.error('❌ [SYNC_PAYMENT] Failed to update order:', updateError)
          } else {
            updatedOrder = updatedOrderData
            console.log(`✅ [SYNC_PAYMENT] Order updated with payment status: ${newPaymentStatus}`)
          }

          // Create Biteship shipment if payment is confirmed and no existing shipment
          if ((newPaidAt || currentPaidAt) && !orderData.biteship_order_id) {
            console.log(`🚚 [SYNC_PAYMENT] Creating Biteship shipment for paid order`)
            
            try {
              // Transform order data for Biteship
              const biteshipOrderData = {
                orderId: updatedOrder.id,
                customerName: updatedOrder.profiles?.full_name || 'Unknown',
                customerPhone: updatedOrder.profiles?.phone || 'Unknown',
                customerEmail: updatedOrder.profiles?.email || 'unknown@example.com',
                shippingAddress: typeof updatedOrder.shipping_address === 'string' 
                  ? JSON.parse(updatedOrder.shipping_address) 
                  : updatedOrder.shipping_address,
                courierCompany: updatedOrder.courier_company || 'jne',
                courierType: updatedOrder.courier_service || 'reg',
                items: (updatedOrder.order_items || []).map((item: any) => ({
                  name: item.product_title,
                  quantity: item.qty,
                  value: item.price_idr,
                  weight: item.qty * 1000 // Convert kg to grams
                })),
                totalValue: updatedOrder.total_idr
              }

              const shipmentResult = await biteship.createOrderFromSikupiOrder(biteshipOrderData)
              
              if (shipmentResult?.id) {
                // Update order with shipment info
                const { error: shipmentUpdateError } = await (supabaseAdmin as any)
                  .from('orders')
                  .update({
                    biteship_order_id: shipmentResult.id,
                    tracking_number: shipmentResult.waybill_id,
                    courier_company: shipmentResult.courier?.company,
                    courier_service: shipmentResult.courier?.type,
                    shipping_status: 'pending',
                    status: 'packed',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', orderId)

                if (!shipmentUpdateError) {
                  shipmentCreated = true
                  console.log(`✅ [SYNC_PAYMENT] Biteship shipment created: ${shipmentResult.id}`)
                  
                  // Fetch final updated order
                  const { data: finalOrder } = await supabaseAdmin
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single()
                  
                  if (finalOrder) {
                    updatedOrder = finalOrder as any
                  }
                }
              } else {
                console.error('❌ [SYNC_PAYMENT] Failed to create Biteship shipment:', shipmentResult)
              }
            } catch (shipmentError) {
              console.error('❌ [SYNC_PAYMENT] Biteship shipment creation error:', shipmentError)
            }
          }
        } else {
          console.error('❌ [SYNC_PAYMENT] Midtrans API error:', midtransResponse.status)
        }
      } catch (midtransError) {
        console.error('❌ [SYNC_PAYMENT] Midtrans request failed:', midtransError)
      }
    }

    // Fallback: Create Biteship shipment for paid orders without Midtrans integration
    if (!shipmentCreated && (orderData.status === 'paid' || orderData.paid_at) && !orderData.biteship_order_id) {
      console.log(`🚚 [SYNC_PAYMENT] Fallback: Creating Biteship shipment for already paid order`)
      
      try {
        // Transform order data for Biteship
        const biteshipOrderData = {
          orderId: orderData.id,
          customerName: orderData.profiles?.full_name || 'Unknown',
          customerPhone: orderData.profiles?.phone || 'Unknown',
          customerEmail: orderData.profiles?.email || 'unknown@example.com',
          shippingAddress: typeof orderData.shipping_address === 'string' 
            ? JSON.parse(orderData.shipping_address) 
            : orderData.shipping_address,
          courierCompany: orderData.courier_company || 'jne',
          courierType: orderData.courier_service || 'reg',
          items: (orderData.order_items || []).map((item: any) => ({
            name: item.product_title,
            quantity: item.qty,
            value: item.price_idr,
            weight: item.qty * 1000 // Convert kg to grams
          })),
          totalValue: orderData.total_idr
        }

        console.log(`📦 [SYNC_PAYMENT] Biteship order data:`, JSON.stringify(biteshipOrderData, null, 2))

        const shipmentResult = await biteship.createOrderFromSikupiOrder(biteshipOrderData)
        
        if (shipmentResult?.id) {
          console.log(`📋 [SYNC_PAYMENT] Fetching order details to get waybill_id`)
          
          // Try to get order details to fetch tracking_id and waybill_id if available
          let waybillId = shipmentResult.waybill_id || null
          let trackingId = (shipmentResult.courier as any)?.tracking_id || null
          
          try {
            const orderDetails = await biteship.getOrderDetails(shipmentResult.id)
            waybillId = orderDetails.waybill_id || waybillId
            trackingId = (orderDetails.courier as any)?.tracking_id || trackingId
            console.log(`📋 [SYNC_PAYMENT] Order details fetched - waybill_id: ${waybillId}, tracking_id: ${trackingId}`)
          } catch (detailsError) {
            console.log(`⚠️  [SYNC_PAYMENT] Could not fetch order details yet: ${detailsError}`)
            // Continue without additional details, will be fetched later via tracking refresh
          }
          
          // Update order with shipment info
          const { error: shipmentUpdateError } = await (supabaseAdmin as any)
            .from('orders')
            .update({
              biteship_order_id: shipmentResult.id,
              tracking_number: waybillId, // Store waybill for user display
              biteship_reference_id: trackingId, // Store tracking_id for API calls
              courier_company: shipmentResult.courier?.company || orderData.courier_company,
              courier_service: shipmentResult.courier?.type || orderData.courier_service,
              shipping_status: trackingId ? 'shipped' : 'pending',
              status: 'packed',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)

          if (!shipmentUpdateError) {
            shipmentCreated = true
            console.log(`✅ [SYNC_PAYMENT] Fallback Biteship shipment created: ${shipmentResult.id}`)
            
            // Fetch final updated order
            const { data: finalOrder } = await supabaseAdmin
              .from('orders')
              .select('*')
              .eq('id', orderId)
              .single()
            
            if (finalOrder) {
              updatedOrder = finalOrder as any
            }
          }
        } else {
          console.error('❌ [SYNC_PAYMENT] Failed to create fallback Biteship shipment:', shipmentResult)
        }
      } catch (shipmentError) {
        console.error('❌ [SYNC_PAYMENT] Fallback Biteship shipment creation error:', shipmentError)
      }
    }

    console.log(`🎉 [SYNC_PAYMENT] Sync completed - Payment Updated: ${paymentUpdated}, Shipment Created: ${shipmentCreated}`)

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        updated: paymentUpdated,
        shipment_created: shipmentCreated
      }
    })

  } catch (error) {
    console.error('❌ [SYNC_PAYMENT] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to sync payment status' }, 
      { status: 500 }
    )
  }
}