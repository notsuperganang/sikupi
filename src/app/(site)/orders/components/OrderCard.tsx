'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Calendar, Truck, CreditCard, Eye, RotateCcw, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Order, OrderItem, OrderStatus } from '@/types/database'

interface OrderCardProps {
  order: Order & {
    order_items?: OrderItem[]
  }
  onStatusRefresh?: (orderId: number) => Promise<void>
}

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'new':
      return 'secondary'
    case 'pending_payment':
      return 'outline'
    case 'paid':
      return 'default'
    case 'packed':
      return 'secondary'
    case 'shipped':
      return 'default'
    case 'completed':
      return 'default'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case 'new':
      return 'Baru'
    case 'pending_payment':
      return 'Menunggu Pembayaran'
    case 'paid':
      return 'Dibayar'
    case 'packed':
      return 'Dikemas'
    case 'shipped':
      return 'Dikirim'
    case 'completed':
      return 'Selesai'
    case 'cancelled':
      return 'Dibatalkan'
    default:
      return status
  }
}

const getNextAction = (order: Order) => {
  switch (order.status) {
    case 'new':
    case 'pending_payment':
      return {
        label: 'Bayar Sekarang',
        href: `/checkout/payment?order_id=${order.id}`,
        variant: 'default' as const,
        icon: CreditCard
      }
    case 'paid':
    case 'packed':
    case 'shipped':
      return {
        label: 'Lihat Detail',
        href: `/orders/${order.id}`,
        variant: 'outline' as const,
        icon: Eye
      }
    case 'completed':
      return {
        label: 'Beli Lagi',
        href: '/products',
        variant: 'outline' as const,
        icon: RotateCcw
      }
    case 'cancelled':
      return {
        label: 'Lihat Detail',
        href: `/orders/${order.id}`,
        variant: 'outline' as const,
        icon: Eye
      }
    default:
      return {
        label: 'Lihat Detail',
        href: `/orders/${order.id}`,
        variant: 'outline' as const,
        icon: Eye
      }
  }
}

export default function OrderCard({ order, onStatusRefresh }: OrderCardProps) {
  const nextAction = getNextAction(order)
  const orderItems = order.order_items || []
  const firstItem = orderItems[0]
  const remainingCount = orderItems.length - 1

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-stone-600" />
            <span className="font-medium text-stone-900">
              Pesanan #{order.id}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(order.created_at), {
                addSuffix: true,
                locale: id
              })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
          
          {/* Status Refresh Button for pending payments */}
          {(order.status === 'pending_payment' || order.status === 'new') && onStatusRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusRefresh(order.id)}
              className="h-6 w-6 p-0"
              title="Periksa status pembayaran"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4">
        {firstItem && (
          <div className="text-sm text-stone-700">
            <span className="font-medium">{firstItem.product_title}</span>
            <span className="text-stone-500"> × {firstItem.qty} {firstItem.unit}</span>
            {remainingCount > 0 && (
              <span className="text-stone-500">
                {' '}dan {remainingCount} item lainnya
              </span>
            )}
          </div>
        )}
        
        {/* Shipping Info */}
        {order.courier_company && (
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
            <Truck className="h-3 w-3" />
            <span>{order.courier_company} - {order.courier_service}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-stone-200">
        <div className="space-y-1">
          <div className="text-sm text-stone-600">
            Total Pesanan
          </div>
          <div className="font-bold text-stone-900">
            Rp {order.total_idr.toLocaleString('id-ID')}
          </div>
        </div>
        
        <Button
          variant={nextAction.variant}
          size="sm"
          asChild
          className="flex items-center gap-2"
        >
          <Link href={nextAction.href}>
            <nextAction.icon className="h-4 w-4" />
            {nextAction.label}
          </Link>
        </Button>
      </div>
    </Card>
  )
}