import { Suspense } from 'react'
import PaymentResultClient from './PaymentResultClient'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Hasil Pembayaran - Sikupi',
  description: 'Verifikasi hasil pembayaran pesanan Anda'
}

function PaymentResultSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-stone-200 rounded-full mx-auto mb-4 animate-pulse" />
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        
        {/* Main content */}
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultSkeleton />}>
      <PaymentResultClient />
    </Suspense>
  )
}