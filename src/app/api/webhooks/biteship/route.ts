import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { biteship } from '@/lib/biteship'
import { generateIdempotencyKey, isAlreadyProcessed, markAsProcessed } from '@/lib/idempotency'

interface BiteshipWebhookPayload {
  id: string
  order_id: string
  status: string
  waybill_id?: string
  link: string
  courier: {
    company: string
    name: string
    phone: string
  }
  origin: {
    contact_name: string
    address: string
  }
  destination: {
    contact_name: string
    address: string
  }
  history: Array<{
    note: string
    updated_at: string
    status: string
  }>
  updated_at: string
  metadata?: Record<string, any>
}

function mapBiteshipStatus(biteshipStatus: string): {
  shipping_status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'returned'
  order_status?: 'pending_payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded'
} {
  switch (biteshipStatus.toLowerCase()) {
    case 'confirmed':
      return { 
        shipping_status: 'confirmed',
        order_status: 'confirmed'
      }
    case 'picked_up':
      return { 
        shipping_status: 'picked_up',
        order_status: 'processing'
      }
    case 'on_process':
    case 'in_transit':
      return { 
        shipping_status: 'in_transit',
        order_status: 'shipped'
      }
    case 'delivered':
      return { 
        shipping_status: 'delivered',
        order_status: 'delivered'
      }
    case 'cancelled':
      return { 
        shipping_status: 'cancelled',
        order_status: 'cancelled'
      }
    case 'returned':
      return { 
        shipping_status: 'returned',
        order_status: 'cancelled'
      }
    default:
      return { 
        shipping_status: 'pending'
      }
  }
}

export async function POST(request: NextRequest) {
  console.log('📦 Biteship webhook received')
  
  try {
    const payload: BiteshipWebhookPayload = await request.json()
    
    console.log('Biteship webhook payload:', {
      id: payload.id,
      order_id: payload.order_id,
      status: payload.status,
      waybill_id: payload.waybill_id,
    })

    // Check for duplicate webhook processing
    const idempotencyKey = generateIdempotencyKey(
      'biteship',
      payload.order_id,
      payload.status
    )
    
    if (isAlreadyProcessed(idempotencyKey)) {
      console.log('⚠️  Duplicate webhook detected, skipping processing:', idempotencyKey)
      return NextResponse.json({ 
        success: true,
        message: 'Duplicate webhook ignored' 
      })
    }

    // Mark as being processed
    markAsProcessed(idempotencyKey)

    const signature = request.headers.get('x-biteship-signature')
    if (signature) {
      const body = JSON.stringify(payload)
      const isValid = biteship.verifyWebhook(signature, body)
      if (!isValid) {
        console.error('❌ Invalid Biteship webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    let internalOrderId: number | null = null
    
    if (payload.metadata?.sikupi_order_id) {
      internalOrderId = parseInt(payload.metadata.sikupi_order_id)
    } else {
      const match = payload.order_id.match(/SIKUPI-SHIP-\d+-\d+-?(\d+)?$/)
      if (match && match[1]) {
        internalOrderId = parseInt(match[1])
      }
    }

    if (!internalOrderId) {
      console.error('❌ Could not extract internal order ID from Biteship webhook')
      return NextResponse.json(
        { error: 'Could not identify internal order' },
        { status: 400 }
      )
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, shipping_status, payment_status')
      .eq('id', internalOrderId)
      .single()

    if (orderError || !order) {
      console.error('❌ Order not found:', internalOrderId, orderError)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const statusMapping = mapBiteshipStatus(payload.status)
    
    const updateData: any = {
      shipping_status: statusMapping.shipping_status,
      updated_at: new Date().toISOString()
    }

    if (statusMapping.order_status) {
      updateData.status = statusMapping.order_status
    }

    if (payload.waybill_id) {
      updateData.tracking_number = payload.waybill_id
    }

    if (payload.status.toLowerCase() === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
      updateData.status = 'completed'
    }

    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update(updateData)
      .eq('id', internalOrderId)

    if (updateError) {
      console.error('❌ Failed to update order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log(`✅ Order ${internalOrderId} updated:`, {
      shipping_status: statusMapping.shipping_status,
      order_status: statusMapping.order_status,
      waybill_id: payload.waybill_id,
    })

    if (payload.history && payload.history.length > 0) {
      const latestHistory = payload.history[0]
      console.log('📋 Latest shipping update:', {
        order_id: internalOrderId,
        status: latestHistory.status,
        note: latestHistory.note,
        updated_at: latestHistory.updated_at,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      order_id: internalOrderId,
      new_status: statusMapping.shipping_status,
    })

  } catch (error) {
    console.error('❌ Biteship webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-biteship-signature',
    },
  })
}