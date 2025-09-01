// Empty cart state component
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Coffee, ArrowRight } from 'lucide-react'

interface EmptyCartProps {
  onContinueShopping?: () => void
  className?: string
}

export default function EmptyCart({ onContinueShopping, className }: EmptyCartProps) {
  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping()
    } else {
      window.location.href = '/products'
    }
  }

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {/* Icon */}
      <div className="mb-6">
        <div className="relative inline-block">
          <ShoppingBag className="h-16 w-16 text-stone-300 mx-auto" />
          <Coffee className="h-6 w-6 text-amber-500 absolute -top-1 -right-1" />
        </div>
      </div>

      {/* Message */}
      <h2 className="text-xl font-semibold text-stone-900 mb-2">
        Keranjangmu masih kosong
      </h2>
      <p className="text-stone-600 mb-8 max-w-sm mx-auto">
        Yuk mulai berbelanja produk ampas kopi berkualitas dari Sikupi. 
        Dari ampas kopi hingga produk turunannya!
      </p>

      {/* Action Button */}
      <Button
        onClick={handleContinueShopping}
        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 text-base"
        size="lg"
      >
        Mulai Belanja
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="text-center">
          <div className="text-amber-600 mb-2">♻️</div>
          <p className="text-xs text-stone-600">Produk Ramah Lingkungan</p>
        </div>
        <div className="text-center">
          <div className="text-amber-600 mb-2">🚚</div>
          <p className="text-xs text-stone-600">Gratis Ongkir*</p>
        </div>
        <div className="text-center">
          <div className="text-amber-600 mb-2">🔒</div>
          <p className="text-xs text-stone-600">Pembayaran Aman</p>
        </div>
      </div>
    </div>
  )
}