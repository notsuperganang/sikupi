'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-stone-200 rounded-full flex items-center justify-center mb-4">
              <Search className="w-16 h-16 text-stone-400" />
            </div>
            <div className="text-6xl font-bold text-stone-300 mb-2">404</div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-stone-600 mb-8">
            Maaf, produk yang Anda cari tidak dapat ditemukan. Mungkin produk sudah tidak tersedia atau URL yang Anda masukkan salah.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">            
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
                onClick={() => window.location.href = '/products'}
                className="flex-1 border-stone-300 hover:bg-stone-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Lihat Produk
              </Button>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>

          {/* Suggestions */}
          <div className="mt-8 text-left bg-white rounded-lg p-4 border border-stone-200">
            <h3 className="font-semibold text-stone-900 mb-2">Saran untuk Anda:</h3>
            <ul className="text-sm text-stone-600 space-y-1">
              <li>• Periksa kembali URL yang Anda masukkan</li>
              <li>• Coba gunakan fitur pencarian</li>
              <li>• Lihat kategori produk yang tersedia</li>
              <li>• Hubungi customer service jika masalah berlanjut</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}