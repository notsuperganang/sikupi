'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/lib/toast-context'
import { makeAuthenticatedRequest } from '@/lib/api-client'

import OrderHeader from './components/OrderHeader'
import OrderStatusSteps from './components/OrderStatusSteps'
import OrderSummaryCard from './components/OrderSummaryCard'
import ShippingAddressCard from './components/ShippingAddressCard'
import PaymentInfoCard from './components/PaymentInfoCard'
import TrackingTimeline from './components/TrackingTimeline'
import SupportCard from './components/SupportCard'

export interface OrderData {
  id: number
  orderCode: string
  createdAt: string
  status: string
  paidAt: string | null
  payment: {
    provider: string
    method: string | null
    transactionId: string | null
    status: string | null
  }
  shipping: {
    courier: string | null
    service: string | null
    waybill: string | null
    eta: string | null
    status: string | null
    address: any
    biteshipOrderId: string | null
  }
  totals: {
    itemsTotal: number
    shippingCost: number
    discount: number
    grandTotal: number
  }
  items: Array<{
    id: number
    productId: number
    title: string
    qty: number
    price: number
    subtotal: number
    unit: string
    attributes: {
      coffeeType: string | null
      grindLevel: string | null
      condition: string | null
    }
  }>
  buyer: {
    name: string
    phone: string
  } | null
  notes: string | null
}

export interface TrackingData {
  courier: string | null
  waybill: string | null
  status: string | null
  eta: string | null
  updatedAt: string | null
  history: Array<{
    time: string
    status: string
    location: string | null
    note: string | null
  }>
}

interface OrderDetailClientProps {
  initialOrder: OrderData
}

export default function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [order, setOrder] = useState<OrderData>(initialOrder)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [isPaymentSyncing, setIsPaymentSyncing] = useState(false)
  const [isTrackingRefreshing, setIsTrackingRefreshing] = useState(false)

  const handlePaymentSync = async () => {
    if (!user) return

    setIsPaymentSyncing(true)
    try {
      console.log('🔄 Syncing payment status for order:', order.id)

      const response = await makeAuthenticatedRequest(
        `/api/orders/${order.id}/sync-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.success && response.data) {
        // Update order data with fresh info
        const updatedOrder = { ...order, ...response.data.order }
        setOrder(updatedOrder)

        if (response.data.updated) {
          toast.success(
            'Status Diperbarui!',
            `Pesanan ${order.orderCode} - Status: ${response.data.order.status}`
          )
        } else {
          toast.info('Status Terkini', 'Status pembayaran sudah yang terbaru')
        }

        // If shipment was created, show notification
        if (response.data.shipment_created) {
          toast.success('Pengiriman Dibuat!', 'Paket siap untuk dikirim')
        }
      } else {
        toast.error('Gagal memperbarui status', response.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Payment sync error:', error)
      toast.error('Gagal memperbarui status', 'Silakan coba lagi')
    } finally {
      setIsPaymentSyncing(false)
    }
  }

  const handleTrackingRefresh = async () => {
    if (!user) return

    setIsTrackingRefreshing(true)
    try {
      console.log('🔄 Refreshing tracking data for order:', order.id)

      const response = await makeAuthenticatedRequest(`/api/orders/${order.id}/tracking`)

      if (response.success && response.data) {
        setTrackingData(response.data.biteship_tracking || null)
        toast.success('Tracking Diperbarui!', 'Data pelacakan berhasil dimuat')
      } else {
        toast.error('Gagal memuat tracking', response.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Tracking refresh error:', error)
      toast.error('Gagal memuat tracking', 'Silakan coba lagi')
    } finally {
      setIsTrackingRefreshing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Order Header */}
        <OrderHeader
          order={order}
          onPaymentSync={handlePaymentSync}
          onTrackingRefresh={handleTrackingRefresh}
          isPaymentSyncing={isPaymentSyncing}
          isTrackingRefreshing={isTrackingRefreshing}
        />

        {/* Order Status Steps */}
        <OrderStatusSteps status={order.status} paidAt={order.paidAt} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <OrderSummaryCard order={order} />
            <ShippingAddressCard address={order.shipping.address} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PaymentInfoCard payment={order.payment} paidAt={order.paidAt} />
            <TrackingTimeline 
              order={order} 
              trackingData={trackingData}
              onRefresh={handleTrackingRefresh}
              isRefreshing={isTrackingRefreshing}
            />
            <SupportCard />
          </div>
        </div>
      </div>
    </div>
  )
}