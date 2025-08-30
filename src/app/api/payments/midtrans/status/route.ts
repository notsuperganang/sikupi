import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { midtrans } from '@/lib/midtrans'

// Query parameter validation
const StatusQuerySchema = z.object({
  order_id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive')
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order_id parameter' },
        { status: 400 }
      )
    }

    // Validate order ID
    const validatedParams = StatusQuerySchema.parse({ order_id: orderId })

    // Get order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, buyer_id, status, payment_status, midtrans_order_id, paid_at, created_at')
      .eq('id', validatedParams.order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderData = order as any

    // If no Midtrans order ID, return current status
    if (!orderData.midtrans_order_id) {
      return NextResponse.json({
        success: true,
        data: {
          order_id: orderData.id,
          status: orderData.status,
          payment_status: orderData.payment_status,
          paid_at: orderData.paid_at,
          midtrans_order_id: null,
          message: 'No payment transaction found',
          verification_source: 'database'
        }
      })
    }

    console.log(`🔍 Checking payment status for order ${orderData.id} (Midtrans: ${orderData.midtrans_order_id})`)

    try {
      // Get real transaction status from Midtrans API
      const midtransStatus = await midtrans.getTransactionStatus(orderData.midtrans_order_id)
      
      console.log('Midtrans API response:', {
        order_id: orderData.midtrans_order_id,
        transaction_status: midtransStatus.transaction_status,
        fraud_status: midtransStatus.fraud_status,
        payment_type: midtransStatus.payment_type
      })

      // Map Midtrans status to our internal order status
      const newOrderStatus = midtrans.mapTransactionStatus(
        midtransStatus.transaction_status,
        midtransStatus.fraud_status
      )

      // Prepare update data
      let orderUpdated = false
      const updateData: any = {
        payment_status: midtransStatus.transaction_status,
        updated_at: new Date().toISOString()
      }

      // Only update if status actually changed and is a valid transition
      const canUpdateStatus = (
        newOrderStatus !== orderData.status && 
        (orderData.status === 'new' || orderData.status === 'pending_payment' || newOrderStatus === 'cancelled')
      )

      if (canUpdateStatus) {
        updateData.status = newOrderStatus

        // Set paid_at timestamp for successful payments
        if (newOrderStatus === 'paid' && !orderData.paid_at) {
          updateData.paid_at = midtransStatus.transaction_time || new Date().toISOString()
        }

        // Update order in database
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update(updateData)
          .eq('id', orderData.id)

        if (updateError) {
          console.error('Failed to update order status:', updateError)
          throw new Error('Failed to update order status')
        }

        orderUpdated = true
        console.log(`✅ Order ${orderData.id} status updated: ${orderData.status} → ${newOrderStatus}`)

        // Log the status change for audit
        console.log(`📋 Payment status verification:`, {
          order_id: orderData.id,
          midtrans_order_id: orderData.midtrans_order_id,
          old_status: orderData.status,
          new_status: newOrderStatus,
          payment_status: midtransStatus.transaction_status,
          fraud_status: midtransStatus.fraud_status,
          transaction_time: midtransStatus.transaction_time,
          payment_type: midtransStatus.payment_type
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          order_id: orderData.id,
          status: orderUpdated ? newOrderStatus : orderData.status,
          payment_status: midtransStatus.transaction_status,
          fraud_status: midtransStatus.fraud_status,
          paid_at: updateData.paid_at || orderData.paid_at,
          midtrans_order_id: orderData.midtrans_order_id,
          updated: orderUpdated,
          verification_source: 'midtrans_api',
          midtrans_data: {
            transaction_id: midtransStatus.transaction_id,
            transaction_time: midtransStatus.transaction_time,
            payment_type: midtransStatus.payment_type,
            gross_amount: midtransStatus.gross_amount,
            status_message: midtransStatus.status_message
          },
          message: orderUpdated 
            ? `Payment status verified and updated to: ${newOrderStatus}`
            : `Payment status verified: ${orderData.status} (no change needed)`
        }
      })

    } catch (midtransError) {
      console.error('Failed to verify payment status with Midtrans:', midtransError)
      
      // Return current database status if Midtrans API fails
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed',
        data: {
          order_id: orderData.id,
          status: orderData.status,
          payment_status: orderData.payment_status,
          paid_at: orderData.paid_at,
          midtrans_order_id: orderData.midtrans_order_id,
          verification_source: 'database_fallback',
          message: 'Could not verify with payment gateway, showing last known status'
        }
      })
    }

  } catch (error) {
    console.error('Payment status check API error:', error)
    
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

export async function POST(request: NextRequest) {
  try {
    // Optional: authenticated endpoint for user-specific status checks
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { order_id, force_refresh } = body

    if (!order_id) {
      return NextResponse.json(
        { error: 'Missing order_id in request body' },
        { status: 400 }
      )
    }

    // Validate order ownership
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, buyer_id, status, payment_status, midtrans_order_id')
      .eq('id', order_id)
      .eq('buyer_id', authResult.user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    // Delegate to GET handler with same logic
    const url = new URL(`${request.url}?order_id=${order_id}`)
    const getRequest = new NextRequest(url, { method: 'GET' })
    
    return await GET(getRequest)

  } catch (error) {
    console.error('Authenticated payment status check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}