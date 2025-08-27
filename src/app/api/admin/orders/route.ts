import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth, adminResponse, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'
import type { OrderStatus } from '@/types/database'

// Query parameters validation
const AdminOrdersQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => Math.max(1, parseInt(val))),
  limit: z.string().optional().default('20').transform(val => Math.min(100, Math.max(1, parseInt(val)))),
  status: z.enum(['new', 'pending_payment', 'paid', 'packed', 'shipped', 'completed', 'cancelled']).optional(),
  search: z.string().optional(),
  date_from: z.string().optional(), // ISO date string
  date_to: z.string().optional(),   // ISO date string
  sort: z.enum(['created_at', 'updated_at', 'total_idr', 'status']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

async function handleGetAdminOrders(
  request: NextRequest,
  adminAuth: AdminAuthResult
) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedQuery = AdminOrdersQuerySchema.parse(queryParams)
    
    // Build base query
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        subtotal_idr,
        shipping_fee_idr,
        total_idr,
        courier_company,
        courier_service,
        biteship_order_id,
        tracking_number,
        shipping_status,
        payment_status,
        paid_at,
        created_at,
        updated_at,
        shipping_address,
        profiles!orders_buyer_id_fkey(full_name, phone),
        order_items(
          id,
          product_title,
          qty,
          price_idr,
          unit
        )
      `, { count: 'exact' })
    
    // Apply filters
    if (validatedQuery.status) {
      query = query.eq('status', validatedQuery.status)
    }
    
    if (validatedQuery.date_from) {
      query = query.gte('created_at', validatedQuery.date_from)
    }
    
    if (validatedQuery.date_to) {
      query = query.lte('created_at', validatedQuery.date_to)
    }
    
    if (validatedQuery.search) {
      // Search in order ID, customer name, or product titles
      const searchTerm = validatedQuery.search.toLowerCase()
      // Note: This is a simple implementation. In production, you might want full-text search
      query = query.or(`id.like.%${searchTerm}%,profiles.full_name.ilike.%${searchTerm}%`)
    }
    
    // Apply sorting
    query = query.order(validatedQuery.sort, { ascending: validatedQuery.order === 'asc' })
    
    // Apply pagination
    const from = (validatedQuery.page - 1) * validatedQuery.limit
    const to = from + validatedQuery.limit - 1
    query = query.range(from, to)
    
    // Execute query
    const { data: orders, error: ordersError, count } = await query
    
    if (ordersError) {
      console.error('Failed to fetch admin orders:', ordersError)
      return adminErrorResponse('Failed to fetch orders', 500)
    }
    
    // Get summary statistics
    const { data: statsData, error: statsError } = await supabaseAdmin
      .from('orders')
      .select('status, total_idr, created_at')
    
    let summary = {
      total_orders: count || 0,
      orders_by_status: {} as Record<string, number>,
      total_revenue: 0,
      average_order_value: 0,
      today_orders: 0,
      pending_fulfillment: 0
    }
    
    if (!statsError && statsData) {
      const today = new Date().toISOString().split('T')[0]
      
      summary = {
        total_orders: count || 0,
        orders_by_status: statsData.reduce((acc: Record<string, number>, order: any) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {}),
        total_revenue: statsData.reduce((sum: number, order: any) => sum + (order.total_idr || 0), 0),
        average_order_value: Math.round((statsData.reduce((sum: number, order: any) => sum + (order.total_idr || 0), 0) / (statsData.length || 1))),
        today_orders: statsData.filter((order: any) => order.created_at.startsWith(today)).length,
        pending_fulfillment: statsData.filter((order: any) => ['paid', 'packed'].includes(order.status)).length
      }
    }
    
    // Format orders for admin dashboard
    const formattedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      status: order.status,
      customer: {
        name: order.profiles?.full_name || 'Unknown',
        phone: order.profiles?.phone || null
      },
      items: {
        count: order.order_items?.length || 0,
        total_quantity: order.order_items?.reduce((sum: number, item: any) => sum + parseFloat(item.qty), 0) || 0,
        preview: order.order_items?.slice(0, 2).map((item: any) => ({
          title: item.product_title,
          quantity: parseFloat(item.qty),
          unit: item.unit
        })) || []
      },
      financial: {
        subtotal_idr: order.subtotal_idr,
        shipping_fee_idr: order.shipping_fee_idr,
        total_idr: order.total_idr,
        payment_status: order.payment_status
      },
      shipping: {
        courier_company: order.courier_company,
        courier_service: order.courier_service,
        address: order.shipping_address,
        biteship_order_id: order.biteship_order_id,
        tracking_number: order.tracking_number,
        shipping_status: order.shipping_status
      },
      timestamps: {
        created_at: order.created_at,
        updated_at: order.updated_at,
        paid_at: order.paid_at
      },
      actions: getAvailableActions(order.status)
    }))
    
    return adminResponse({
      orders: formattedOrders,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / validatedQuery.limit),
        has_next: (count || 0) > validatedQuery.page * validatedQuery.limit,
        has_previous: validatedQuery.page > 1
      },
      summary,
      filters: {
        status: validatedQuery.status,
        search: validatedQuery.search,
        date_from: validatedQuery.date_from,
        date_to: validatedQuery.date_to
      }
    })
    
  } catch (error) {
    console.error('Admin orders fetch error:', error)
    
    if (error instanceof z.ZodError) {
      return adminErrorResponse(
        'Invalid query parameters',
        400,
        error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      )
    }
    
    return adminErrorResponse('Internal server error', 500)
  }
}

/**
 * Get available actions for an order based on its current status
 */
function getAvailableActions(status: OrderStatus): Array<{
  action: string;
  label: string;
  status_target: OrderStatus;
  type: 'primary' | 'secondary' | 'danger';
}> {
  const actions: Array<{
    action: string;
    label: string;
    status_target: OrderStatus;
    type: 'primary' | 'secondary' | 'danger';
  }> = []
  
  switch (status) {
    case 'new':
      actions.push(
        { action: 'mark_pending_payment', label: 'Mark Pending Payment', status_target: 'pending_payment', type: 'primary' },
        { action: 'cancel', label: 'Cancel', status_target: 'cancelled', type: 'danger' }
      )
      break
    case 'pending_payment':
      actions.push(
        { action: 'mark_paid', label: 'Mark Paid', status_target: 'paid', type: 'primary' },
        { action: 'cancel', label: 'Cancel', status_target: 'cancelled', type: 'danger' }
      )
      break
    case 'paid':
      actions.push(
        { action: 'mark_packed', label: 'Mark Packed', status_target: 'packed', type: 'primary' },
        { action: 'cancel', label: 'Cancel', status_target: 'cancelled', type: 'danger' }
      )
      break
    case 'packed':
      actions.push(
        { action: 'create_shipment', label: 'Create Shipment', status_target: 'shipped', type: 'primary' }
      )
      break
    case 'shipped':
      actions.push(
        { action: 'mark_completed', label: 'Mark Completed', status_target: 'completed', type: 'secondary' }
      )
      break
  }
  
  return actions
}

// Export with admin auth middleware
export const GET = requireAdminAuth(handleGetAdminOrders)