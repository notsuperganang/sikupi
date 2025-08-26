import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { midtrans } from '@/lib/midtrans'

// Request validation schema
const StatusRequestSchema = z.object({
  order_id: z.string().min(1),
  buyer_id: z.string().uuid().optional() // For additional security
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const buyerId = searchParams.get('buyer_id')

    const validatedData = StatusRequestSchema.parse({
      order_id: orderId,
      buyer_id: buyerId
    })

    // Find the order in our database
    let query = supabaseAdmin
      .from('orders')
      .select('id, status, payment_status, midtrans_order_id, total_idr, paid_at, buyer_id')
      .eq('id', parseInt(validatedData.order_id))

    // Add buyer validation if provided
    if (validatedData.buyer_id) {
      query = query.eq('buyer_id', validatedData.buyer_id)
    }

    const { data: order, error: orderError } = await query.single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    let midtransStatus = null
    
    // Get latest status from Midtrans if we have a Midtrans order ID
    if ((order as any).midtrans_order_id) {
      try {
        midtransStatus = await midtrans.getTransactionStatus((order as any).midtrans_order_id)
        
        // Update our database with the latest status if it differs
        const latestStatus = midtrans.mapTransactionStatus(
          midtransStatus.transaction_status,
          midtransStatus.fraud_status
        )

        if (latestStatus !== (order as any).status) {
          const updateData: any = {
            payment_status: midtransStatus.transaction_status,
            updated_at: new Date().toISOString()
          }

          if (latestStatus === 'paid' && (order as any).status !== 'paid') {
            updateData.status = 'paid'
            updateData.paid_at = new Date().toISOString()
          } else if (latestStatus !== 'paid') {
            updateData.status = latestStatus
          }

          await (supabaseAdmin as any)
            .from('orders')
            .update(updateData)
            .eq('id', (order as any).id)

          // Update our order object for the response
          ;(order as any).status = latestStatus
          ;(order as any).payment_status = midtransStatus.transaction_status
        }
      } catch (error) {
        console.error('Failed to get Midtrans status:', error)
        // Continue with database status if Midtrans call fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: (order as any).id,
        order_status: (order as any).status,
        payment_status: (order as any).payment_status,
        total_amount: (order as any).total_idr,
        paid_at: (order as any).paid_at,
        midtrans_data: midtransStatus ? {
          transaction_id: midtransStatus.transaction_id,
          transaction_status: midtransStatus.transaction_status,
          payment_type: midtransStatus.payment_type,
          transaction_time: midtransStatus.transaction_time,
          fraud_status: midtransStatus.fraud_status,
          masked_card: midtransStatus.masked_card,
          bank: midtransStatus.bank,
          va_numbers: midtransStatus.va_numbers
        } : null
      }
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = StatusRequestSchema.parse(body)

    // Same logic as GET but with POST body
    return GET(request)
  } catch (error) {
    console.error('Payment status check error:', error)
    
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}