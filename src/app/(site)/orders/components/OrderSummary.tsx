'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  Package, 
  CheckCircle, 
  Clock, 
  CreditCard,
  TrendingUp
} from 'lucide-react'

interface OrderSummaryData {
  total_orders: number
  total_spent_idr: number
  orders_by_status: Record<string, number>
}

interface OrderSummaryProps {
  summary: OrderSummaryData
  isLoading?: boolean
}

const SUMMARY_CARDS = [
  {
    key: 'total_orders',
    title: 'Total Pesanan',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    getValue: (summary: OrderSummaryData) => summary.total_orders.toString()
  },
  {
    key: 'total_spent',
    title: 'Total Pengeluaran',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    getValue: (summary: OrderSummaryData) => `Rp ${summary.total_spent_idr.toLocaleString('id-ID')}`
  },
  {
    key: 'pending_payment',
    title: 'Menunggu Pembayaran',
    icon: CreditCard,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    getValue: (summary: OrderSummaryData) => (summary.orders_by_status.pending_payment || 0).toString()
  },
  {
    key: 'active_orders',
    title: 'Pesanan Aktif',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    getValue: (summary: OrderSummaryData) => {
      const activeStatuses = ['paid', 'packed', 'shipped']
      const activeCount = activeStatuses.reduce((count, status) => {
        return count + (summary.orders_by_status[status] || 0)
      }, 0)
      return activeCount.toString()
    }
  },
  {
    key: 'completed',
    title: 'Pesanan Selesai',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    getValue: (summary: OrderSummaryData) => (summary.orders_by_status.completed || 0).toString()
  }
] as const

export default function OrderSummary({ summary, isLoading = false }: OrderSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-stone-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-stone-200 rounded w-16" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {SUMMARY_CARDS.map((card) => {
        const Icon = card.icon
        const value = card.getValue(summary)
        
        return (
          <Card key={card.key} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-600 truncate">
                  {card.title}
                </p>
                <p className="text-lg font-semibold text-stone-900">
                  {value}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}