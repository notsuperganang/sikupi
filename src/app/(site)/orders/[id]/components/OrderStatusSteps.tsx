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
}

interface Step {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  current: boolean
}

export default function OrderStatusSteps({ status, paidAt }: OrderStatusStepsProps) {
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
      completed: ['packed', 'to_ship', 'shipped', 'completed'].includes(status),
      current: status === 'to_ship'
    },
    {
      key: 'shipped',
      label: 'Dikirim',
      icon: Truck,
      completed: ['shipped', 'completed'].includes(status),
      current: status === 'shipped'
    },
    {
      key: 'completed',
      label: 'Selesai',
      icon: CheckCircle2,
      completed: status === 'completed',
      current: status === 'completed'
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
                      flex-1 h-0.5 mx-4 transition-colors
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
            {status === 'new' && 'Pesanan baru dibuat, menunggu pembayaran'}
            {status === 'pending_payment' && 'Menunggu konfirmasi pembayaran'}
            {status === 'paid' && 'Pembayaran berhasil, pesanan sedang diproses'}
            {status === 'to_ship' && 'Pesanan siap untuk dikirim'}
            {status === 'packed' && 'Pesanan sudah dikemas dan siap dikirim'}
            {status === 'shipped' && 'Pesanan sedang dalam perjalanan'}
            {status === 'completed' && 'Pesanan telah selesai dan diterima'}
            {status === 'cancelled' && 'Pesanan dibatalkan'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}