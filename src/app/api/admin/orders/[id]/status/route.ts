import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'
import type { OrderStatus } from '@/types/database'

// Valid status transitions
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  'new': ['pending_payment', 'cancelled'],
  'pending_payment': ['paid', 'cancelled'],
  'paid': ['packed', 'cancelled'],
  'packed': ['shipped', 'cancelled'],
  'shipped': ['completed'],
  'completed': [], // Final state
  'cancelled': [] // Final state
}

// Order status update validation schema
const UpdateOrderStatusSchema = z.object({
  status: z.enum(['new', 'pending_payment', 'paid', 'packed', 'shipped', 'completed', 'cancelled']),
  notes: z.string().optional(),
  notify_customer: z.boolean().default(true)
})

// Route parameter validation
const OrderParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive')
})

async function handleUpdateOrderStatus(
  request: NextRequest,
  adminAuth: AdminAuthResult,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate route parameters
    const resolvedParams = await params
    const validatedParams = OrderParamsSchema.parse(resolvedParams)
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateOrderStatusSchema.parse(body)
    
    // Get current order details
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, status, buyer_id, total_idr, midtrans_order_id')
      .eq('id', validatedParams.id)
      .single()
    
    if (fetchError || !currentOrder) {
      return adminErrorResponse('Order not found', 404)
    }
    
    const orderData = currentOrder as any
    const currentStatus = orderData.status as OrderStatus
    const newStatus = validatedData.status as OrderStatus
    
    // Validate status transition
    if (currentStatus === newStatus) {
      return adminErrorResponse('Order is already in this status', 400)
    }
    
    if (!STATUS_TRANSITIONS[currentStatus].includes(newStatus)) {
      return adminErrorResponse(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
        400,
        { 
          current_status: currentStatus,
          allowed_transitions: STATUS_TRANSITIONS[currentStatus]
        }
      )
    }
    
    // Prepare update data
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    }
    
    // Add specific timestamps based on status
    switch (newStatus) {
      case 'paid':
        updateData.paid_at = new Date().toISOString()
        break
      case 'shipped':
        // Note: In next step we'll integrate with Biteship here
        updateData.shipping_status = 'shipped'
        break
      case 'completed':
        updateData.shipping_status = 'delivered'
        break
      case 'cancelled':
        updateData.shipping_status = 'cancelled'
        break
    }
    
    // Update order status
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update(updateData)
      .eq('id', validatedParams.id)
    
    if (updateError) {
      console.error('Failed to update order status:', updateError)
      return adminErrorResponse('Failed to update order status', 500)
    }
    
    // Log admin action for audit trail
    console.log(`Admin ${adminAuth.profile?.full_name} updated order ${validatedParams.id} from ${currentStatus} to ${newStatus}`)
    
    // Get updated order details
    const { data: updatedOrder, error: refetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        buyer_id,
        total_idr,
        paid_at,
        updated_at,
        shipping_status,
        order_items(product_title, qty, price_idr)
      `)
      .eq('id', validatedParams.id)
      .single()
    
    if (refetchError) {
      console.error('Failed to refetch updated order:', refetchError)
    }
    
    return adminResponse({
      order_id: validatedParams.id,
      previous_status: currentStatus,
      new_status: newStatus,
      updated_by: adminAuth.profile?.full_name || 'Admin',
      updated_at: updateData.updated_at,
      order_details: updatedOrder || null,
      notes: validatedData.notes || null
    })
    
  } catch (error) {
    console.error('Update order status error:', error)
    
    if (error instanceof z.ZodError) {
      return adminErrorResponse(
        'Invalid request data',
        400,
        error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      )
    }
    
    return adminErrorResponse('Internal server error', 500)
  }
}

// Export with admin auth middleware
export const PUT = requireAdminAuth(handleUpdateOrderStatus)