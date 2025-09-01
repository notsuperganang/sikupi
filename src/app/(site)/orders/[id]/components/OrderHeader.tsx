import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CreditCard, CalendarDays } from 'lucide-react'
import { OrderData } from '../OrderDetailClient'

interface OrderHeaderProps {
  order: OrderData
  onPaymentSync: () => void
  onTrackingRefresh: () => void
  isPaymentSyncing: boolean
  isTrackingRefreshing: boolean
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending_payment':
    case 'new':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'packed':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'shipped':
    case 'to_ship':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-stone-100 text-stone-800 border-stone-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Dibayar'
    case 'pending_payment':
      return 'Menunggu Pembayaran'
    case 'new':
      return 'Pesanan Baru'
    case 'packed':
      return 'Dikemas'
    case 'shipped':
      return 'Dikirim'
    case 'to_ship':
      return 'Siap Kirim'
    case 'completed':
      return 'Selesai'
    case 'cancelled':
      return 'Dibatalkan'
    default:
      return status
  }
}

export default function OrderHeader({ 
  order, 
  onPaymentSync, 
  onTrackingRefresh, 
  isPaymentSyncing, 
  isTrackingRefreshing 
}: OrderHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900">
          Pesanan {order.orderCode}
        </h1>
        <div className="flex items-center gap-2 text-stone-600 mt-1">
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm">
            Dibuat {new Date(order.createdAt).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric', 
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Status and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={getStatusBadgeColor(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
              
              {order.paidAt && (
                <span className="text-sm text-stone-600">
                  Dibayar {new Date(order.paidAt).toLocaleDateString('id-ID')}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPaymentSync}
                disabled={isPaymentSyncing}
              >
                <CreditCard className={`h-4 w-4 mr-2 ${isPaymentSyncing ? 'animate-pulse' : ''}`} />
                {isPaymentSyncing ? 'Memeriksa...' : 'Periksa Status Pembayaran'}
              </Button>

              {order.shipping.biteshipOrderId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTrackingRefresh}
                  disabled={isTrackingRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isTrackingRefreshing ? 'animate-spin' : ''}`} />
                  {isTrackingRefreshing ? 'Memuat...' : 'Refresh Tracking'}
                </Button>
              )}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="mt-3 pt-3 border-t border-stone-200">
              <p className="text-sm text-stone-600">
                <span className="font-medium">Catatan:</span> {order.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}