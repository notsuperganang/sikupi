'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Order detail page error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Gagal Memuat Detail Pesanan
            </h2>
            
            <p className="text-stone-600 mb-6">
              Terjadi kesalahan saat memuat detail pesanan. Silakan coba lagi atau kembali ke halaman pesanan.
            </p>

            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                Coba Lagi
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Pesanan
                </Link>
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-stone-500">
                  Debug Info (Development)
                </summary>
                <pre className="text-xs bg-stone-100 p-3 rounded mt-2 overflow-auto">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}