import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { biteship } from '@/lib/biteship'
import { requireAdminAuth, adminResponse, adminErrorResponse, AdminAuthResult } from '@/lib/admin-auth'

// Route parameter validation
const OrderParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val)).refine(val => val > 0, 'Order ID must be positive')
})

// Shipment creation validation schema
const CreateShipmentSchema = z.object({
  auto_update_status: z.boolean().default(true),
  notify_customer: z.boolean().default(true),
  notes: z.string().optional()
})

async function handleCreateShipment(
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
    const validatedData = CreateShipmentSchema.parse(body)
    
    // Get order details with items and customer info
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        total_idr,
        shipping_address,
        courier_company,
        courier_service,
        biteship_order_id,
        tracking_number,
        profiles!orders_buyer_id_fkey(full_name, phone),
        order_items(
          product_id,
          product_title,
          price_idr,
          qty,
          unit
        )
      `)
      .eq('id', validatedParams.id)
      .single()
    
    if (orderError || !order) {
      return adminErrorResponse('Order not found', 404)
    }
    
    const orderData = order as any
    
    // Validate order can be shipped
    if (!['paid', 'packed'].includes(orderData.status)) {
      return adminErrorResponse(
        `Order cannot be shipped. Current status: ${orderData.status}. Order must be 'paid' or 'packed' to create shipment.`,
        400
      )
    }
    
    // Check if shipment already exists
    if (orderData.biteship_order_id) {
      return adminErrorResponse(
        `Shipment already exists for this order. Biteship Order ID: ${orderData.biteship_order_id}`,
        409
      )
    }
    
    // Validate required data
    if (!orderData.shipping_address) {
      return adminErrorResponse('Order missing shipping address', 400)
    }
    
    if (!orderData.courier_company || !orderData.courier_service) {
      return adminErrorResponse('Order missing courier information', 400)
    }
    
    if (!orderData.order_items || orderData.order_items.length === 0) {
      return adminErrorResponse('Order has no items', 400)
    }
    
    // Prepare items for shipping (calculate weights)
    const shippingItems = orderData.order_items.map((item: any) => ({
      name: item.product_title,
      quantity: parseFloat(item.qty),
      value: item.price_idr * parseFloat(item.qty),
      weight: biteship.kgToGrams(parseFloat(item.qty)) // Convert kg to grams
    }))
    
    // Prepare customer information
    const customerName = orderData.profiles?.full_name || orderData.shipping_address.recipient_name
    const customerPhone = orderData.profiles?.phone || orderData.shipping_address.phone
    const customerEmail = orderData.shipping_address.email
    
    // Create Biteship shipment
    console.log(`Admin ${adminAuth.profile?.full_name} creating shipment for order ${validatedParams.id}`)
    
    const biteshipOrder = await biteship.createOrderFromSikupiOrder({
      orderId: orderData.id,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress: orderData.shipping_address,
      courierCompany: orderData.courier_company,
      courierType: orderData.courier_service,
      items: shippingItems,
      totalValue: orderData.total_idr
    })
    
    // Update order with Biteship information
    const updateData: any = {
      biteship_order_id: biteshipOrder.id,
      tracking_number: biteshipOrder.order_id || biteshipOrder.id,
      shipping_status: 'created',
      updated_at: new Date().toISOString()
    }
    
    // Auto-update status to shipped if requested
    if (validatedData.auto_update_status) {
      updateData.status = 'shipped'
    }
    
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update(updateData)
      .eq('id', validatedParams.id)
    
    if (updateError) {
      console.error('Failed to update order with shipment info:', updateError)
      return adminErrorResponse('Shipment created but failed to update order', 500, {
        biteship_order_id: biteshipOrder.id,
        biteship_status: biteshipOrder.status
      })
    }
    
    // Log successful creation
    console.log(`Shipment created successfully for order ${validatedParams.id}:`, {
      biteship_order_id: biteshipOrder.id,
      tracking_number: biteshipOrder.order_id,
      status: biteshipOrder.status
    })
    
    return adminResponse({
      order_id: validatedParams.id,
      shipment: {
        biteship_order_id: biteshipOrder.id,
        tracking_number: biteshipOrder.order_id || biteshipOrder.id,
        status: biteshipOrder.status,
        courier: {
          company: orderData.courier_company,
          service: orderData.courier_service
        },
        price: biteshipOrder.price || null,
        reference_id: biteshipOrder.reference_id || null
      },
      order_status_updated: validatedData.auto_update_status ? 'shipped' : orderData.status,
      created_by: adminAuth.profile?.full_name || 'Admin',
      created_at: new Date().toISOString(),
      tracking_url: `https://tracking.biteship.com/${biteshipOrder.order_id || biteshipOrder.id}`,
      notes: validatedData.notes || null
    })
    
  } catch (error) {
    console.error('Create shipment error:', error)
    
    // Handle Biteship API errors specifically
    if (error instanceof Error && error.message.includes('Biteship API Error')) {
      return adminErrorResponse(
        'Failed to create shipment with Biteship',
        502,
        { biteship_error: error.message }
      )
    }
    
    if (error instanceof z.ZodError) {
      return adminErrorResponse(
        'Invalid request data',
        400,
        error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      )
    }
    
    return adminErrorResponse('Failed to create shipment', 500)
  }
}

// Export with admin auth middleware
export const POST = requireAdminAuth(handleCreateShipment)