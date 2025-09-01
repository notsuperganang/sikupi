'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'

interface ProductErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProductError({ error, reset }: ProductErrorProps) {
  useEffect(() => {
    console.error('Product page error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Terjadi Kesalahan
          </h1>
          <p className="text-stone-600 mb-8">
            Maaf, terjadi kesalahan saat memuat produk ini. Silakan coba lagi atau kembali ke halaman sebelumnya.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={reset}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Coba Lagi
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1 border-stone-300 hover:bg-stone-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1 border-stone-300 hover:bg-stone-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Beranda
              </Button>
            </div>
          </div>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 bg-red-50 border border-red-200 rounded text-left text-sm">
              <summary className="cursor-pointer font-semibold text-red-800 mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-red-700 whitespace-pre-wrap break-all">
                {error.message}
                {error.stack && '\n\nStack trace:\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </main>
  )
}