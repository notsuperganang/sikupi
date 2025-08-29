// Cart summary with totals and checkout CTA
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatRupiah } from '@/lib/currency'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import type { CartTotals } from '@/server/cart-adapter'

interface CartSummaryProps {
  totals: CartTotals
  itemCount: number
  onCheckout?: () => void
  onContinueShopping?: () => void
  className?: string
}

export default function CartSummary({ 
  totals, 
  itemCount, 
  onCheckout,
  onContinueShopping,
  className 
}: CartSummaryProps) {
  const hasItems = itemCount > 0
  const isFreeShipping = totals.subtotal >= 200000

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout()
    } else {
      // Default behavior - navigate to checkout
      window.location.href = '/checkout'
    }
  }

  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping()
    } else {
      // Default behavior - navigate to products
      window.location.href = '/products'
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-lg text-stone-900">Ringkasan</h2>
        </div>

        {hasItems ? (
          <>
            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal ({itemCount} item)</span>
                <span className="font-medium">{formatRupiah(totals.subtotal)}</span>
              </div>

              {/* Free shipping notification */}
              {isFreeShipping ? (
                <div className="flex justify-between text-sm text-green-600">
                  <span>🚚 Ongkir</span>
                  <span className="font-medium">Gratis!</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Ongkir</span>
                    <span className="font-medium">{formatRupiah(totals.shipping)}</span>
                  </div>
                  <div className="text-xs text-stone-500 bg-amber-50 p-2 rounded">
                    💡 Gratis ongkir untuk pembelian ≥ {formatRupiah(200000)}
                    <div className="mt-1">
                      Tambah {formatRupiah(200000 - totals.subtotal)} lagi
                    </div>
                  </div>
                </>
              )}

              {/* Mock voucher discount */}
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon Voucher</span>
                  <span className="font-medium">-{formatRupiah(totals.discount)}</span>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-base font-semibold">
                <span className="text-stone-900">Total</span>
                <span className="text-amber-700">{formatRupiah(totals.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button 
                onClick={handleCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                Lanjut ke Pembayaran
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleContinueShopping}
                className="w-full border-stone-300 hover:bg-stone-50"
              >
                Lanjut Belanja
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-stone-500 space-y-1">
              <p>✅ Harga sudah termasuk PPN</p>
              <p>📦 Barang akan dikemas dengan aman</p>
              <p>🔒 Pembayaran 100% aman</p>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-6">
            <div className="text-stone-400 mb-3">
              <ShoppingBag className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-stone-600 mb-4">Keranjang masih kosong</p>
            <Button 
              onClick={handleContinueShopping}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Mulai Belanja
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}