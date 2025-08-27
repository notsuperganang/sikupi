import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

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

export async function GET(
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

    // Fetch order details with items and ensure it belongs to the user
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
        biteship_order_id,
        courier_company,
        courier_service,
        tracking_number,
        shipping_status,
        midtrans_order_id,
        midtrans_token,
        payment_status,
        paid_at,
        notes,
        created_at,
        updated_at,
        order_items(
          id,
          product_id,
          product_title,
          price_idr,
          qty,
          unit,
          coffee_type,
          grind_level,
          condition,
          image_url
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

    // Calculate order summary
    const orderItems = (order as any).order_items || []
    const summary = {
      total_items: orderItems.reduce((sum: number, item: any) => sum + parseFloat(item.qty.toString()), 0),
      items_count: orderItems.length,
      subtotal_idr: (order as any).subtotal_idr,
      shipping_fee_idr: (order as any).shipping_fee_idr,
      total_idr: (order as any).total_idr
    }

    // Determine next actions based on order status
    const orderData = order as any
    let next_actions = []
    switch (orderData.status) {
      case 'new':
        next_actions.push({
          action: 'make_payment',
          label: 'Proceed to Payment',
          url: `/checkout/payment?order_id=${orderData.id}`,
          type: 'primary'
        })
        next_actions.push({
          action: 'cancel_order',
          label: 'Cancel Order',
          url: `/api/orders/${orderData.id}/cancel`,
          type: 'secondary'
        })
        break
      case 'pending_payment':
        next_actions.push({
          action: 'complete_payment',
          label: 'Complete Payment',
          url: orderData.midtrans_token ? `https://app.sandbox.midtrans.com/snap/v3/redirection/${orderData.midtrans_token}` : `/checkout/payment?order_id=${orderData.id}`,
          type: 'primary'
        })
        next_actions.push({
          action: 'check_payment',
          label: 'Check Payment Status',
          url: `/api/midtrans/status?order_id=${orderData.id}`,
          type: 'secondary'
        })
        break
      case 'paid':
        next_actions.push({
          action: 'track_shipment',
          label: 'Track Shipment',
          url: `/orders/${orderData.id}/tracking`,
          type: 'primary'
        })
        break
      case 'shipped':
        next_actions.push({
          action: 'track_shipment',
          label: 'Track Package',
          url: orderData.tracking_number ? `/api/orders/${orderData.id}/tracking` : `/orders/${orderData.id}/tracking`,
          type: 'primary'
        })
        
        // Add external tracking link if available
        if (orderData.tracking_number) {
          next_actions.push({
            action: 'external_tracking',
            label: 'Track on Courier Website',
            url: getExternalTrackingUrl(orderData.courier_company, orderData.tracking_number),
            type: 'secondary'
          })
        }
        break
      case 'completed':
        next_actions.push({
          action: 'write_review',
          label: 'Write Review',
          url: `/orders/${orderData.id}/review`,
          type: 'primary'
        })
        next_actions.push({
          action: 'reorder',
          label: 'Order Again',
          url: `/orders/${orderData.id}/reorder`,
          type: 'secondary'
        })
        break
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: orderData.id,
          status: orderData.status,
          payment_status: orderData.payment_status,
          shipping_address: orderData.shipping_address,
          courier_company: orderData.courier_company,
          courier_service: orderData.courier_service,
          tracking_number: orderData.tracking_number,
          shipping_status: orderData.shipping_status,
          notes: orderData.notes,
          paid_at: orderData.paid_at,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          midtrans_order_id: orderData.midtrans_order_id
        },
        items: orderItems.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_title: item.product_title,
          price_idr: item.price_idr,
          quantity: parseFloat(item.qty.toString()),
          unit: item.unit,
          coffee_type: item.coffee_type,
          grind_level: item.grind_level,
          condition: item.condition,
          image_url: item.image_url,
          subtotal_idr: item.price_idr * parseFloat(item.qty.toString())
        })),
        summary,
        next_actions,
        timeline: [
          {
            status: 'new',
            label: 'Order Created',
            completed: true,
            timestamp: orderData.created_at
          },
          {
            status: 'pending_payment',
            label: 'Awaiting Payment',
            completed: ['pending_payment', 'paid', 'packed', 'shipped', 'completed'].includes(orderData.status),
            timestamp: orderData.status === 'pending_payment' ? orderData.updated_at : null
          },
          {
            status: 'paid',
            label: 'Payment Confirmed',
            completed: ['paid', 'packed', 'shipped', 'completed'].includes(orderData.status),
            timestamp: orderData.paid_at
          },
          {
            status: 'packed',
            label: 'Order Packed',
            completed: ['packed', 'shipped', 'completed'].includes(orderData.status),
            timestamp: orderData.status === 'packed' ? orderData.updated_at : null
          },
          {
            status: 'shipped',
            label: 'Order Shipped',
            completed: ['shipped', 'completed'].includes(orderData.status),
            timestamp: orderData.status === 'shipped' ? orderData.updated_at : null
          },
          {
            status: 'completed',
            label: 'Order Completed',
            completed: orderData.status === 'completed',
            timestamp: orderData.status === 'completed' ? orderData.updated_at : null
          }
        ]
      }
    })

  } catch (error) {
    console.error('Get order details API error:', error)
    
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

/**
 * Get external tracking URL based on courier company
 */
function getExternalTrackingUrl(courier: string | null, trackingNumber: string): string {
  if (!courier || !trackingNumber) {
    return '#'
  }
  
  const courierUrls: Record<string, string> = {
    'jne': `https://www.jne.co.id/id/tracking/trace/${trackingNumber}`,
    'pos': `https://www.posindonesia.co.id/id/tracking/${trackingNumber}`,
    'tiki': `https://www.tiki.id/id/tracking?tracking_number=${trackingNumber}`,
    'sicepat': `https://www.sicepat.com/checkAwb/${trackingNumber}`,
    'jnt': `https://www.jet.co.id/tracking/${trackingNumber}`,
    'ninja': `https://www.ninjaxpress.co/en-id/tracking?id=${trackingNumber}`
  }
  
  const courierKey = courier.toLowerCase()
  return courierUrls[courierKey] || `https://www.google.com/search?q=${courier}+tracking+${trackingNumber}`
}