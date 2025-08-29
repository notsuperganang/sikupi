import { Suspense } from 'react'
import CheckoutPageClient from './CheckoutPageClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Checkout | Sikupi',
  description: 'Complete your coffee grounds purchase',
}

function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Progress steps */}
        <div className="mb-8">
          <Skeleton className="h-2 w-full" />
        </div>
        
        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutPageClient />
    </Suspense>
  )
}