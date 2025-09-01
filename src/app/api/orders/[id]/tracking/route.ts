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
        console.log(`🔄 [TRACKING] Processing Biteship order ${orderData.biteship_order_id}`)
        
        // First, try to get latest order details to update waybill_id if needed
        let updatedWaybillId = orderData.tracking_number
        let trackingId = orderData.biteship_reference_id
        try {
          console.log(`📋 [TRACKING] Fetching latest order details for tracking info`)
          const orderDetails = await biteship.getOrderDetails(orderData.biteship_order_id)
          
          // Update waybill_id if available
          if (orderDetails.waybill_id && orderDetails.waybill_id !== orderData.tracking_number) {
            console.log(`📝 [TRACKING] New waybill_id found: ${orderDetails.waybill_id}`)
            updatedWaybillId = orderDetails.waybill_id
          }
          
          // Update tracking_id if available
          if ((orderDetails.courier as any)?.tracking_id && (orderDetails.courier as any).tracking_id !== trackingId) {
            console.log(`📝 [TRACKING] New tracking_id found: ${(orderDetails.courier as any).tracking_id}`)
            trackingId = (orderDetails.courier as any).tracking_id
          }
          
          // Update database with new info
          if (updatedWaybillId !== orderData.tracking_number || trackingId !== orderData.biteship_reference_id) {
            await (supabaseAdmin as any)
              .from('orders')
              .update({ 
                tracking_number: updatedWaybillId,
                biteship_reference_id: trackingId,
                shipping_status: trackingId ? 'shipped' : 'pending',
                updated_at: new Date().toISOString()
              })
              .eq('id', orderData.id)
            
            console.log(`✅ [TRACKING] Database updated - waybill: ${updatedWaybillId}, tracking_id: ${trackingId}`)
          }
        } catch (detailsError) {
          console.log(`⚠️  [TRACKING] Could not fetch order details: ${detailsError}`)
        }
        
        // Now try to get tracking data if we have a tracking_id
        let biteshipTracking: any = null
        if (trackingId) {
          console.log(`🔍 [TRACKING] Fetching tracking data using tracking_id: ${trackingId}`)
          
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Tracking request timeout')), 5000)
          )
          
          biteshipTracking = await Promise.race([
            biteship.trackOrder(trackingId), // Use tracking_id instead of biteship_order_id
            timeoutPromise
          ])
        } else {
          console.log(`⚠️  [TRACKING] No tracking_id available yet, skipping tracking API`)
        }
        
        // Add normalized Biteship tracking information if available
        if (biteshipTracking) {
          trackingResponse.biteship_tracking = {
            courier: (biteshipTracking as any)?.courier?.company || orderData.courier_company,
            waybill: (biteshipTracking as any)?.waybill_id || updatedWaybillId,
            status: normalizeTrackingStatus((biteshipTracking as any)?.status),
            eta: (biteshipTracking as any)?.delivery?.datetime || null,
            updatedAt: (biteshipTracking as any)?.updated_at || new Date().toISOString(),
            history: ((biteshipTracking as any)?.history || []).map((h: any) => ({
              time: h?.updated_at,
              status: h?.status,
              location: extractLocation(h?.note) || null,
              note: h?.note
            }))
          }
        } else if (updatedWaybillId) {
          // If we have waybill but no tracking data yet, provide basic info
          trackingResponse.biteship_tracking = {
            courier: orderData.courier_company,
            waybill: updatedWaybillId,
            status: 'pending',
            eta: null,
            updatedAt: new Date().toISOString(),
            history: [
              {
                time: new Date().toISOString(),
                status: 'Order created',
                location: null,
                note: 'Waybill number assigned, tracking will be available shortly'
              }
            ]
          }
        }
        
        // Enhance timeline with Biteship data
        if (biteshipTracking?.history && biteshipTracking.history.length > 0) {
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
 * Normalize tracking status to common format
 */
function normalizeTrackingStatus(status: string | null): string | null {
  if (!status) return null
  
  const statusMapping: Record<string, string> = {
    'picked': 'picked_up',
    'picked_up': 'picked_up', 
    'drop_off': 'in_transit',
    'on_process': 'in_transit',
    'in_transit': 'in_transit',
    'delivered': 'delivered',
    'completed': 'delivered',
    'cancelled': 'cancelled',
    'return_to_shipper': 'returned'
  }
  
  return statusMapping[status.toLowerCase()] || status
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