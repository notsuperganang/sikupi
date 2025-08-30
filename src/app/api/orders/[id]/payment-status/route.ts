import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { midtrans } from '@/lib/midtrans'

// Route parameter validation
const PaymentStatusParamsSchema = z.object({
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
    const validatedParams = PaymentStatusParamsSchema.parse(resolvedParams)

    // Get order and verify ownership
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, buyer_id, status, payment_status, midtrans_order_id')
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

    // If no Midtrans order ID, return current status
    if (!orderData.midtrans_order_id) {
      return NextResponse.json({
        success: true,
        data: {
          order_id: orderData.id,
          status: orderData.status,
          payment_status: orderData.payment_status,
          midtrans_order_id: null,
          can_retry_payment: false,
          message: 'No payment transaction found'
        }
      })
    }

    try {
      // Check payment status from Midtrans
      const midtransStatus = await midtrans.getTransactionStatus(orderData.midtrans_order_id)
      
      console.log(`Payment status check for order ${orderData.id}:`, {
        midtrans_order_id: orderData.midtrans_order_id,
        transaction_status: midtransStatus.transaction_status,
        fraud_status: midtransStatus.fraud_status
      })

      // Map Midtrans status to our order status
      const newOrderStatus = midtrans.mapTransactionStatus(
        midtransStatus.transaction_status,
        midtransStatus.fraud_status
      )

      // Update local order status if different
      let orderUpdated = false
      if (newOrderStatus !== orderData.status && newOrderStatus !== 'pending_payment') {
        const updateData: any = {
          status: newOrderStatus,
          payment_status: midtransStatus.transaction_status,
          updated_at: new Date().toISOString()
        }

        if (newOrderStatus === 'paid' && orderData.status !== 'paid') {
          updateData.paid_at = new Date().toISOString()
        }

        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update(updateData)
          .eq('id', orderData.id)

        if (updateError) {
          console.error('Failed to update order status:', updateError)
        } else {
          orderUpdated = true
          console.log(`Order ${orderData.id} status updated from ${orderData.status} to ${newOrderStatus}`)
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          order_id: orderData.id,
          status: orderUpdated ? newOrderStatus : orderData.status,
          payment_status: midtransStatus.transaction_status,
          midtrans_order_id: orderData.midtrans_order_id,
          can_retry_payment: ['pending', 'expire'].includes(midtransStatus.transaction_status),
          updated: orderUpdated,
          midtrans_data: {
            transaction_id: midtransStatus.transaction_id,
            transaction_time: midtransStatus.transaction_time,
            payment_type: midtransStatus.payment_type,
            gross_amount: midtransStatus.gross_amount
          },
          message: orderUpdated ? 'Order status updated successfully' : 'Order status is up to date'
        }
      })

    } catch (midtransError) {
      console.error('Failed to check Midtrans status:', midtransError)
      
      // Return current local status if Midtrans check fails
      return NextResponse.json({
        success: true,
        data: {
          order_id: orderData.id,
          status: orderData.status,
          payment_status: orderData.payment_status,
          midtrans_order_id: orderData.midtrans_order_id,
          can_retry_payment: orderData.status === 'pending_payment',
          error: 'Failed to check payment status from gateway',
          message: 'Using local order status (payment gateway unavailable)'
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
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
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
    const validatedParams = PaymentStatusParamsSchema.parse(resolvedParams)

    // Parse request body for manual status update
    const body = await request.json()
    const { force_refresh, new_status } = body

    // Get order and verify ownership
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
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

    // Manual status update (for testing/admin purposes)
    if (new_status && ['paid', 'cancelled'].includes(new_status)) {
      const updateData: any = {
        status: new_status,
        updated_at: new Date().toISOString()
      }

      if (new_status === 'paid' && orderData.status !== 'paid') {
        updateData.paid_at = new Date().toISOString()
        updateData.payment_status = 'settlement'
      } else if (new_status === 'cancelled') {
        updateData.payment_status = 'cancel'
      }

      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderData.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          order_id: orderData.id,
          status: new_status,
          payment_status: updateData.payment_status,
          updated: true,
          message: `Order status manually updated to ${new_status}`
        }
      })
    }

    // Force refresh from Midtrans
    if (force_refresh && orderData.midtrans_order_id) {
      try {
        const midtransStatus = await midtrans.getTransactionStatus(orderData.midtrans_order_id)
        const newOrderStatus = midtrans.mapTransactionStatus(
          midtransStatus.transaction_status,
          midtransStatus.fraud_status
        )

        if (newOrderStatus !== orderData.status) {
          const updateData: any = {
            status: newOrderStatus,
            payment_status: midtransStatus.transaction_status,
            updated_at: new Date().toISOString()
          }

          if (newOrderStatus === 'paid' && orderData.status !== 'paid') {
            updateData.paid_at = new Date().toISOString()
          }

          await supabaseAdmin
            .from('orders')
            .update(updateData)
            .eq('id', orderData.id)

          return NextResponse.json({
            success: true,
            data: {
              order_id: orderData.id,
              status: newOrderStatus,
              payment_status: midtransStatus.transaction_status,
              updated: true,
              message: `Order status refreshed from payment gateway`
            }
          })
        }

        return NextResponse.json({
          success: true,
          data: {
            order_id: orderData.id,
            status: orderData.status,
            payment_status: midtransStatus.transaction_status,
            updated: false,
            message: 'Order status is already up to date'
          }
        })

      } catch (midtransError) {
        return NextResponse.json(
          { error: 'Failed to refresh payment status from gateway' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'No action specified' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Payment status update API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}