import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { biteship } from '@/lib/biteship'

// Route parameter validation
const OrderParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive')
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

    // Get order details and ensure it belongs to the user
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        courier_company,
        courier_service,
        biteship_order_id,
        tracking_number,
        shipping_status,
        shipping_address,
        created_at,
        updated_at,
        paid_at
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
    
    // Initialize response with basic order tracking info
    const trackingResponse: any = {
      order_id: orderData.id,
      status: orderData.status,
      courier: {
        company: orderData.courier_company,
        service: orderData.courier_service
      },
      tracking_number: orderData.tracking_number,
      shipping_address: orderData.shipping_address,
      timeline: [
        {
          status: 'created',
          label: 'Order Created',
          completed: true,
          timestamp: orderData.created_at,
          description: 'Your order has been successfully created'
        },
        {
          status: 'paid',
          label: 'Payment Confirmed',
          completed: ['paid', 'packed', 'shipped', 'completed'].includes(orderData.status),
          timestamp: orderData.paid_at,
          description: 'Payment has been confirmed and order is being processed'
        }
      ]
    }
    
    // If there's a Biteship order, get real tracking data
    if (orderData.biteship_order_id) {
      try {
        console.log(`Fetching Biteship tracking for order ${orderData.biteship_order_id}`)
        
        const biteshipTracking = await biteship.trackOrder(orderData.biteship_order_id)
        
        // Add Biteship tracking information
        trackingResponse.biteship_tracking = {
          order_id: biteshipTracking.order_id,
          status: biteshipTracking.status,
          waybill_id: biteshipTracking.waybill_id,
          courier: biteshipTracking.courier,
          origin: biteshipTracking.origin,
          destination: biteshipTracking.destination,
          tracking_url: `https://tracking.biteship.com/${orderData.tracking_number}`,
          history: biteshipTracking.history?.map(h => ({
            status: h.status,
            note: h.note,
            updated_at: h.updated_at,
            timestamp: h.updated_at
          })) || []
        }
        
        // Enhance timeline with Biteship data
        if (biteshipTracking.history && biteshipTracking.history.length > 0) {
          // Add shipment created
          trackingResponse.timeline.push({
            status: 'shipped',
            label: 'Package Shipped',
            completed: true,
            timestamp: biteshipTracking.history[0]?.updated_at,
            description: `Package has been handed over to ${orderData.courier_company}`
          })
          
          // Add tracking history
          biteshipTracking.history.forEach((historyItem: any) => {
            trackingResponse.timeline.push({
              status: 'tracking_update',
              label: getTrackingLabel(historyItem.status),
              completed: true,
              timestamp: historyItem.updated_at,
              description: historyItem.note,
              location: extractLocation(historyItem.note),
              tracking_status: historyItem.status
            })
          })
          
          // Add delivery if completed
          if (biteshipTracking.status === 'delivered' || orderData.status === 'completed') {
            trackingResponse.timeline.push({
              status: 'delivered',
              label: 'Package Delivered',
              completed: true,
              timestamp: biteshipTracking.history[biteshipTracking.history.length - 1]?.updated_at,
              description: 'Package has been successfully delivered'
            })
          }
        }
        
        // Add estimated delivery (if available from Biteship)
        if (biteshipTracking.status === 'on_process' || biteshipTracking.status === 'shipped') {
          trackingResponse.estimated_delivery = {
            date: calculateEstimatedDelivery(orderData.courier_company, orderData.courier_service),
            note: 'Estimated delivery date based on courier service'
          }
        }
        
      } catch (biteshipError) {
        console.error('Failed to fetch Biteship tracking:', biteshipError)
        
        // If Biteship tracking fails, provide basic tracking info
        trackingResponse.tracking_error = 'Unable to fetch real-time tracking data'
        
        // Add basic shipment info if we have tracking number
        if (orderData.tracking_number && ['shipped', 'completed'].includes(orderData.status)) {
          trackingResponse.timeline.push({
            status: 'shipped',
            label: 'Package Shipped',
            completed: true,
            timestamp: orderData.updated_at,
            description: `Package shipped via ${orderData.courier_company} ${orderData.courier_service}`,
            tracking_number: orderData.tracking_number
          })
        }
      }
    } else {
      // No Biteship tracking - provide basic status-based timeline
      if (['packed', 'shipped', 'completed'].includes(orderData.status)) {
        trackingResponse.timeline.push({
          status: 'packed',
          label: 'Order Packed',
          completed: true,
          timestamp: orderData.updated_at,
          description: 'Your order has been packed and is ready for shipment'
        })
      }
      
      if (['shipped', 'completed'].includes(orderData.status)) {
        trackingResponse.timeline.push({
          status: 'shipped',
          label: 'Order Shipped',
          completed: true,
          timestamp: orderData.updated_at,
          description: `Order shipped via ${orderData.courier_company} ${orderData.courier_service}`
        })
      }
      
      if (orderData.status === 'completed') {
        trackingResponse.timeline.push({
          status: 'completed',
          label: 'Order Completed',
          completed: true,
          timestamp: orderData.updated_at,
          description: 'Your order has been completed'
        })
      }
    }
    
    // Sort timeline by timestamp
    trackingResponse.timeline.sort((a: any, b: any) => {
      if (!a.timestamp && !b.timestamp) return 0
      if (!a.timestamp) return 1
      if (!b.timestamp) return -1
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })
    
    return NextResponse.json({
      success: true,
      data: trackingResponse
    })

  } catch (error) {
    console.error('Get order tracking API error:', error)
    
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
 * Get human-readable label for tracking status
 */
function getTrackingLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'picked_up': 'Package Picked Up',
    'drop_off': 'Package at Drop Point',
    'on_process': 'In Transit',
    'delivered': 'Package Delivered',
    'return_to_shipper': 'Returned to Sender',
    'cancelled': 'Shipment Cancelled'
  }
  
  return statusLabels[status] || `Status: ${status}`
}

/**
 * Extract location from tracking note
 */
function extractLocation(note: string): string | null {
  // Simple location extraction - could be improved with regex
  const locationKeywords = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang']
  
  for (const location of locationKeywords) {
    if (note.toLowerCase().includes(location.toLowerCase())) {
      return location
    }
  }
  
  return null
}

/**
 * Calculate estimated delivery date based on courier service
 */
function calculateEstimatedDelivery(courier: string, service: string): string {
  const now = new Date()
  let daysToAdd = 3 // Default
  
  // Estimate based on courier and service
  if (courier?.toLowerCase() === 'jne') {
    if (service?.toLowerCase() === 'reg') daysToAdd = 5
    if (service?.toLowerCase() === 'oke') daysToAdd = 7
    if (service?.toLowerCase() === 'yes') daysToAdd = 2
  } else if (courier?.toLowerCase() === 'pos') {
    daysToAdd = 4
  } else if (courier?.toLowerCase() === 'tiki') {
    daysToAdd = 3
  }
  
  const estimatedDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
  return estimatedDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
}