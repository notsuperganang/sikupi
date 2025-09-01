import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ShoppingCart, 
  CreditCard, 
  Package, 
  Truck, 
  CheckCircle2 
} from 'lucide-react'

interface OrderStatusStepsProps {
  status: string
  paidAt: string | null
  trackingData?: any
}

interface Step {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  current: boolean
}

export default function OrderStatusSteps({ status, paidAt, trackingData }: OrderStatusStepsProps) {
  // Determine if order is shipped based on tracking data
  const hasShippingActivity = trackingData?.history?.length > 0
  
  // Get the latest status by sorting by time
  const sortedHistory = trackingData?.history?.slice().sort((a: any, b: any) => 
    new Date(b.time).getTime() - new Date(a.time).getTime()
  )
  const latestTrackingStatus = sortedHistory?.[0]?.status?.toLowerCase()
  
  const isShipped = hasShippingActivity && ['picked', 'picking', 'pickup', 'in_transit', 'dropping_off', 'delivered'].some(s => 
    latestTrackingStatus?.includes(s)
  )

  const steps: Step[] = [
    {
      key: 'new',
      label: 'Pesanan',
      icon: ShoppingCart,
      completed: true,
      current: status === 'new'
    },
    {
      key: 'paid',
      label: 'Dibayar',
      icon: CreditCard,
      completed: !!paidAt && ['paid', 'packed', 'to_ship', 'shipped', 'completed'].includes(status),
      current: status === 'pending_payment' || (status === 'paid' && !['packed', 'to_ship', 'shipped', 'completed'].includes(status))
    },
    {
      key: 'packed',
      label: 'Diproses',
      icon: Package,
      completed: ['packed', 'to_ship', 'shipped', 'completed'].includes(status) || isShipped,
      current: status === 'to_ship' || (status === 'paid' && !isShipped)
    },
    {
      key: 'shipped',
      label: 'Dikirim',
      icon: Truck,
      completed: ['shipped', 'completed'].includes(status) || isShipped,
      current: (status === 'shipped' || (isShipped && !latestTrackingStatus?.includes('delivered'))) && !latestTrackingStatus?.includes('delivered')
    },
    {
      key: 'completed',
      label: 'Selesai',
      icon: CheckCircle2,
      completed: status === 'completed' || latestTrackingStatus?.includes('delivered'),
      current: status === 'completed' || latestTrackingStatus?.includes('delivered')
    }
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1
            
            return (
              <div key={step.key} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                      ${step.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step.current
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white border-stone-300 text-stone-400'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Step Label */}
                  <span 
                    className={`
                      mt-2 text-sm font-medium text-center
                      ${step.completed || step.current ? 'text-stone-900' : 'text-stone-500'}
                    `}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div 
                    className={`
                      flex-1 h-1 mx-4 transition-colors duration-300 rounded-full
                      ${step.completed ? 'bg-green-500' : 'bg-stone-300'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Status Description */}
        <div className="mt-4 text-center">
          <p className="text-sm text-stone-600">
            {(() => {
              if (status === 'cancelled') return 'Pesanan dibatalkan'
              if (status === 'completed' || latestTrackingStatus?.includes('delivered')) return 'Pesanan telah selesai dan diterima'
              if ((status === 'shipped' || isShipped) && !latestTrackingStatus?.includes('delivered')) return 'Pesanan sedang dalam perjalanan'
              if (status === 'packed') return 'Pesanan sudah dikemas dan siap dikirim'
              if (status === 'to_ship') return 'Pesanan siap untuk dikirim'
              if (status === 'paid' && isShipped) return 'Pesanan sudah dikemas dan siap dikirim'
              if (status === 'paid' && !isShipped) return 'Pembayaran berhasil, pesanan sedang diproses'
              if (status === 'pending_payment') return 'Menunggu konfirmasi pembayaran'
              if (status === 'new') return 'Pesanan baru dibuat, menunggu pembayaran'
              return 'Status tidak diketahui'
            })()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}