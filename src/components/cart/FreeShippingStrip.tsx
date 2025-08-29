// Mock free shipping banner component
'use client'

import React from 'react'
import { Truck, Info } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'

interface FreeShippingStripProps {
  currentTotal: number
  freeShippingThreshold?: number
  className?: string
}

export default function FreeShippingStrip({ 
  currentTotal, 
  freeShippingThreshold = 200000, 
  className 
}: FreeShippingStripProps) {
  const isEligible = currentTotal >= freeShippingThreshold
  const remaining = freeShippingThreshold - currentTotal
  const progressPercentage = Math.min((currentTotal / freeShippingThreshold) * 100, 100)

  if (isEligible) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 text-green-700">
          <Truck className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            🎉 Selamat! Kamu mendapat gratis ongkir
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-amber-800">
          <Truck className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            Gratis ongkir dengan pembelian min. {formatRupiah(freeShippingThreshold)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-amber-100 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-amber-700">
              Tambah {formatRupiah(remaining)} lagi
            </span>
            <span className="text-xs text-amber-600 font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-1 text-xs text-amber-700">
          <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span>
            *Gratis ongkir berlaku untuk wilayah Aceh, menggunakan kurir reguler
          </span>
        </div>
      </div>
    </div>
  )
}