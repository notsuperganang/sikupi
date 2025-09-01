import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { biteship } from '@/lib/biteship'
import { NotificationService } from '@/lib/notifications'

// Route parameter validation
const ConfirmOrderParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive')
})

// Helper function to get authenticated user (optional for this endpoint)
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
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = ConfirmOrderParamsSchema.parse(resolvedParams)

    console.log(`🔄 Order confirmation requested for order ${validatedParams.id}`)

    // Get order details with all necessary data
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        payment_status,
        subtotal_idr,
        shipping_fee_idr,
        total_idr,
        shipping_address,
        courier_company,
        courier_service,
        biteship_order_id,
        shipping_status,
        midtrans_order_id,
        notes,
        created_at,
        order_items (
          id,
          product_id,
          product_title,
          price_idr,
          qty,
          unit,
          coffee_type,
          grind_level,
          condition
        ),
        profiles!buyer_id (
          full_name,
          phone
        )
      `)
      .eq('id', validatedParams.id)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderData = order as any

    // Verify order is in paid status
    if (orderData.status !== 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Order confirmation not allowed',
        message: `Order must be in 'paid' status. Current status: ${orderData.status}`,
        data: {
          order_id: orderData.id,
          status: orderData.status,
          payment_status: orderData.payment_status
        }
      })
    }

    // Check if shipment already exists (idempotency)
    if (orderData.biteship_order_id) {
      console.log(`✅ Shipment already exists for order ${orderData.id}: ${orderData.biteship_order_id}`)
      
      // Try to get latest tracking info
      try {
        const trackingInfo = await biteship.trackOrder(orderData.biteship_order_id)
        
        return NextResponse.json({
          success: true,
          message: 'Shipment already exists',
          data: {
            order_id: orderData.id,
            status: orderData.status,
            shipping_status: orderData.shipping_status,
            biteship_order_id: orderData.biteship_order_id,
            existing: true,
            tracking: {
              status: trackingInfo.status,
              waybill_id: trackingInfo.waybill_id,
              courier: trackingInfo.courier,
              latest_checkpoint: trackingInfo.history?.[0] || null,
              tracking_url: trackingInfo.link
            }
          }
        })
      } catch (trackingError) {
        console.error('Failed to get tracking info:', trackingError)
        
        return NextResponse.json({
          success: true,
          message: 'Shipment already exists (tracking unavailable)',
          data: {
            order_id: orderData.id,
            status: orderData.status,
            shipping_status: orderData.shipping_status,
            biteship_order_id: orderData.biteship_order_id,
            existing: true,
            tracking_error: 'Could not fetch latest tracking info'
          }
        })
      }
    }

    // Validate required shipping data
    if (!orderData.shipping_address || !orderData.courier_company || !orderData.courier_service) {
      return NextResponse.json({
        success: false,
        error: 'Incomplete shipping information',
        message: 'Order missing required shipping address or courier details',
        data: {
          order_id: orderData.id,
          has_shipping_address: !!orderData.shipping_address,
          has_courier_company: !!orderData.courier_company,
          has_courier_service: !!orderData.courier_service
        }
      })
    }

    // Get customer info from profile
    const profile = orderData.profiles
    const customerName = profile?.full_name || orderData.shipping_address.recipient_name
    const customerPhone = profile?.phone || orderData.shipping_address.phone
    const customerEmail = orderData.shipping_address.email

    if (!customerName || !customerPhone || !customerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Incomplete customer information',
        message: 'Missing customer name, phone, or email for shipping',
        data: {
          order_id: orderData.id,
          has_customer_name: !!customerName,
          has_customer_phone: !!customerPhone,
          has_customer_email: !!customerEmail
        }
      })
    }

    console.log(`📦 Creating Biteship order for order ${orderData.id}`)

    // Prepare shipping items
    const shippingItems = orderData.order_items.map((item: any) => {
      const quantity = parseFloat(item.qty.toString())
      const weightKg = quantity // Assuming qty is in kg
      const weightGrams = biteship.kgToGrams(weightKg)
      const itemValue = Math.round(item.price_idr * quantity)
      
      return {
        name: item.product_title,
        quantity: Math.ceil(quantity),
        value: itemValue,
        weight: weightGrams // Convert to grams for Biteship
      }
    })

    // Calculate total value
    const totalValue = shippingItems.reduce((sum: number, item: any) => sum + item.value, 0)

    // Map courier service name to Biteship courier type
    const courierTypeMapping: Record<string, string> = {
      'Regular': 'reg',
      'OKE': 'oke', 
      'YES': 'yes',
      'Express': 'express',
      'Same Day': 'sdd',
      'Next Day': 'ndd'
    }
    
    const courierType = courierTypeMapping[orderData.courier_service] || 'reg'

    // Create Biteship order using the helper method
    try {
      const biteshipOrder = await biteship.createOrderFromSikupiOrder({
        orderId: orderData.id,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress: orderData.shipping_address,
        courierCompany: orderData.courier_company,
        courierType,
        items: shippingItems,
        totalValue
      })

      console.log(`✅ Biteship order created successfully:`, {
        sikupi_order_id: orderData.id,
        biteship_order_id: biteshipOrder.id,
        waybill_id: biteshipOrder.waybill_id,
        status: biteshipOrder.status
      })

      // Update order with Biteship details
      const { error: updateError } = await (supabaseAdmin as any)
        .from('orders')
        .update({
          biteship_order_id: biteshipOrder.id,
          tracking_number: biteshipOrder.waybill_id || null,
          shipping_status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.id)

      if (updateError) {
        console.error('Failed to update order with Biteship details:', updateError)
        return NextResponse.json({
          success: false,
          error: 'Failed to update order record',
          message: 'Shipment created but could not save details to database',
          data: {
            order_id: orderData.id,
            biteship_order_id: biteshipOrder.id,
            update_error: updateError.message
          }
        })
      }

      // Get initial tracking information
      let trackingInfo = null
      try {
        trackingInfo = await biteship.trackOrder(biteshipOrder.id)
        console.log(`📍 Initial tracking info retrieved for order ${orderData.id}`)
      } catch (trackingError) {
        console.error('Failed to get initial tracking info:', trackingError)
        // Don't fail the whole operation for tracking errors
      }

      // Send notification to customer
      try {
        await NotificationService.createFromTemplate(
          'shipment_created',
          orderData.buyer_id,
          {
            order_id: orderData.id,
            waybill_id: biteshipOrder.waybill_id,
            courier: orderData.courier_company.toUpperCase(),
            customer_name: customerName
          }
        )
        console.log(`📧 Shipment notification sent for order ${orderData.id}`)
      } catch (notificationError) {
        console.error('Failed to send shipment notification:', notificationError)
        // Don't fail for notification errors
      }

      return NextResponse.json({
        success: true,
        message: 'Order confirmed and shipment created successfully',
        data: {
          order_id: orderData.id,
          status: orderData.status,
          shipping_status: 'confirmed',
          biteship_order_id: biteshipOrder.id,
          waybill_id: biteshipOrder.waybill_id,
          courier: {
            company: orderData.courier_company,
            type: courierType,
            service: orderData.courier_service
          },
          tracking: trackingInfo ? {
            status: trackingInfo.status,
            link: trackingInfo.link,
            latest_checkpoint: trackingInfo.history?.[0] || null
          } : null,
          created: true,
          created_at: new Date().toISOString()
        }
      })

    } catch (biteshipError) {
      console.error('Failed to create Biteship order:', biteshipError)
      
      const errorMessage = biteshipError instanceof Error ? biteshipError.message : 'Unknown Biteship error'
      
      // Don't fail order confirmation for shipping errors - just log and inform
      return NextResponse.json({
        success: false,
        error: 'Failed to create shipment',
        message: `Order is paid but shipment creation failed: ${errorMessage}`,
        data: {
          order_id: orderData.id,
          status: orderData.status,
          payment_status: orderData.payment_status,
          shipping_error: errorMessage,
          can_retry: true
        }
      })
    }

  } catch (error) {
    console.error('Order confirmation API error:', error)
    
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
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if order can be confirmed
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const validatedParams = ConfirmOrderParamsSchema.parse(resolvedParams)

    // Get basic order info
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, payment_status, biteship_order_id, shipping_status')
      .eq('id', validatedParams.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderData = order as any

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderData.id,
        status: orderData.status,
        payment_status: orderData.payment_status,
        shipping_status: orderData.shipping_status,
        has_shipment: !!orderData.biteship_order_id,
        can_confirm: orderData.status === 'paid' && !orderData.biteship_order_id,
        message: orderData.status !== 'paid' 
          ? `Order must be paid to create shipment (current: ${orderData.status})`
          : orderData.biteship_order_id
            ? 'Shipment already exists'
            : 'Ready to create shipment'
      }
    })

  } catch (error) {
    console.error('Order confirmation check error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}