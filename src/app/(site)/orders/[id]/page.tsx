import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import OrderDetailClient from './OrderDetailClient'
import OrderDetailSkeleton from './loading'

export const metadata = {
  title: 'Detail Pesanan - Sikupi',
  description: 'Detail dan tracking pesanan Anda'
}

async function getOrderDetails(orderId: string) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_title,
          price_idr,
          qty,
          unit,
          coffee_type,
          grind_level,
          condition
        ),
        profiles!buyer_id (
          full_name,
          phone
        )
      `)
      .eq('id', parseInt(orderId))
      .single()

    if (error || !order) {
      return null
    }

    return order
  } catch (error) {
    console.error('Error fetching order details:', error)
    return null
  }
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = await params
  const orderId = resolvedParams.id

  if (!orderId || isNaN(parseInt(orderId))) {
    notFound()
  }

  const orderData = await getOrderDetails(orderId)

  if (!orderData) {
    notFound()
  }

  // Cast to any to avoid TypeScript issues
  const order = orderData as any
  
  // Transform data for client component
  const transformedOrder = {
    id: order?.id || 0,
    orderCode: `#${order?.id || 0}`,
    createdAt: order?.created_at || new Date().toISOString(),
    status: order?.status || 'new',
    paidAt: order?.paid_at || null,
    payment: {
      provider: 'midtrans',
      method: order?.payment_status || null,
      transactionId: order?.midtrans_order_id || null,
      status: order?.payment_status || null
    },
    shipping: {
      courier: order?.courier_company || null,
      service: order?.courier_service || null,
      waybill: order?.tracking_number || null,
      eta: null,
      status: order?.shipping_status || null,
      address: order?.shipping_address ? (() => {
        const addr = typeof order.shipping_address === 'string' 
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
        
        return {
          recipientName: addr?.recipient_name || addr?.recipientName || '',
          recipientPhone: addr?.phone || addr?.recipientPhone || '',
          address: addr?.address || '',
          area: addr?.area_id || addr?.area || '',
          city: addr?.city || '',
          province: addr?.province || 'Unknown Province',
          postalCode: addr?.postal_code || addr?.postalCode || '',
          notes: addr?.notes || null
        };
      })() : null,
      biteshipOrderId: order?.biteship_order_id || null
    },
    totals: {
      itemsTotal: order?.subtotal_idr || 0,
      shippingCost: order?.shipping_fee_idr || 0,
      discount: 0,
      grandTotal: order?.total_idr || 0
    },
    items: (order?.order_items || []).map((item: any) => ({
      id: item?.id || 0,
      productId: item?.product_id || 0,
      title: item?.product_title || 'Unknown Product',
      qty: parseFloat(item?.qty || '0'),
      price: item?.price_idr || 0,
      subtotal: (item?.price_idr || 0) * parseFloat(item?.qty || '0'),
      unit: item?.unit || 'kg',
      attributes: {
        coffeeType: item?.coffee_type || null,
        grindLevel: item?.grind_level || null,
        condition: item?.condition || null
      }
    })),
    buyer: order?.profiles ? {
      name: order.profiles.full_name || 'Unknown',
      phone: order.profiles.phone || null
    } : null,
    notes: order?.notes || null
  }

  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailClient initialOrder={transformedOrder} />
    </Suspense>
  )
}