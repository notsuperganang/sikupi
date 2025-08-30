'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  ShoppingCart, 
  Search,
  FilterX,
  Coffee
} from 'lucide-react'
import type { OrderStatus } from '@/types/database'

interface EmptyOrdersStateProps {
  statusFilter: OrderStatus | 'all'
  searchQuery: string
  onClearFilters: () => void
}

export default function EmptyOrdersState({ 
  statusFilter, 
  searchQuery, 
  onClearFilters 
}: EmptyOrdersStateProps) {
  const hasFilters = statusFilter !== 'all' || searchQuery.trim()
  
  if (hasFilters) {
    // Empty results due to filters
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <Search className="h-16 w-16 text-stone-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-stone-900 mb-3">
            Tidak Ada Pesanan Ditemukan
          </h3>
          <p className="text-stone-600 mb-6">
            Tidak ada pesanan yang sesuai dengan filter atau pencarian Anda. 
            Coba ubah kriteria pencarian atau hapus filter.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onClearFilters}
              className="w-full sm:w-auto"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Hapus Semua Filter
            </Button>
            
            <div className="text-sm text-stone-500">
              atau
            </div>
            
            <Button 
              variant="outline" 
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="/products">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Mulai Berbelanja
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // No orders at all
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="relative mb-6">
          <Package className="h-16 w-16 text-stone-400 mx-auto mb-2" />
          <Coffee className="h-8 w-8 text-amber-600 absolute -bottom-1 -right-2 bg-white rounded-full p-1" />
        </div>
        
        <h3 className="text-xl font-semibold text-stone-900 mb-3">
          Belum Ada Pesanan
        </h3>
        <p className="text-stone-600 mb-6">
          Anda belum memiliki pesanan apapun. Mulai berbelanja produk ampas kopi 
          berkualitas dan dapatkan manfaat maksimal dari limbah kopi Anda!
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/products">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Jelajahi Produk
            </Link>
          </Button>
          
          <div className="text-sm text-stone-500">
            Atau pelajari lebih lanjut tentang
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/analyzer">
                Ampas Analyzer
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/magazine">
                Majalah Sikupi
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Benefits highlight */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-stone-600">
            <div className="text-center">
              <div className="font-medium text-stone-900 mb-1">🌱 Ramah Lingkungan</div>
              <div>Manfaatkan limbah kopi</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-stone-900 mb-1">💰 Nilai Ekonomis</div>
              <div>Dapatkan produk berkualitas</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-stone-900 mb-1">🚀 Inovatif</div>
              <div>Teknologi AI untuk analisis</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}