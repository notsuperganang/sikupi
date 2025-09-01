// Cart summary with totals and checkout CTA
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatRupiah } from '@/lib/currency'
import { ShoppingBag, ArrowRight, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth'
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
  const { user, loading } = useAuth()
  const hasItems = itemCount > 0
  const freeShippingThreshold = 200000
  const isEligibleForFreeShipping = totals.subtotal >= freeShippingThreshold

  // Log render state
  console.log('🛒 [CART_SUMMARY] Rendered with:', {
    hasUser: !!user,
    userEmail: user?.email,
    loading,
    hasItems,
    itemCount,
    subtotal: totals.subtotal,
    timestamp: new Date().toISOString()
  })

  const handleCheckout = () => {
    console.log('🛒 [CART_SUMMARY] handleCheckout called with state:', {
      hasUser: !!user,
      userEmail: user?.email,
      loading,
      hasItems,
      itemCount,
      timestamp: new Date().toISOString()
    })
    
    // Don't redirect if auth is still loading
    if (loading) {
      console.log('🛒 [CART_SUMMARY] Auth still loading, returning early')
      return
    }
    
    if (!user) {
      console.log('🛒 [CART_SUMMARY] No user found, redirecting to login')
      // Redirect to login with checkout as return URL only if auth finished loading
      window.location.href = '/login?returnTo=/checkout'
      return
    }
    
    console.log('🛒 [CART_SUMMARY] User authenticated, proceeding to checkout')
    if (onCheckout) {
      console.log('🛒 [CART_SUMMARY] Calling onCheckout callback')
      onCheckout()
    } else {
      console.log('🛒 [CART_SUMMARY] Navigating to checkout page')
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

              {/* Shipping info - will be calculated at checkout */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600">🚚</span>
                  <span className="text-sm font-medium text-blue-800">Informasi Pengiriman</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Ongkir dihitung berdasarkan alamat tujuan</p>
                  <p>• Gratis ongkir untuk pembelian ≥ {formatRupiah(freeShippingThreshold)}</p>
                  <p>• Estimasi tiba: 1-3 hari kerja</p>
                  {!isEligibleForFreeShipping && (
                    <p className="font-medium text-blue-800">
                      Tambah {formatRupiah(freeShippingThreshold - totals.subtotal)} lagi untuk gratis ongkir!
                    </p>
                  )}
                  {isEligibleForFreeShipping && (
                    <p className="font-medium text-green-700 flex items-center gap-1">
                      🎉 Selamat! Anda dapat gratis ongkir
                    </p>
                  )}
                </div>
              </div>

              {/* Mock voucher discount */}
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon Voucher</span>
                  <span className="font-medium">-{formatRupiah(totals.discount)}</span>
                </div>
              )}

              <Separator />

              {/* Subtotal as current total */}
              <div className="flex justify-between text-base font-semibold">
                <span className="text-stone-900">Subtotal</span>
                <span className="text-amber-700">{formatRupiah(totals.subtotal - totals.discount)}</span>
              </div>
              
              {/* Note about final total */}
              <div className="text-xs text-stone-500 bg-stone-50 p-2 rounded">
                💡 Total akhir termasuk ongkir akan ditampilkan di halaman checkout
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button 
                onClick={handleCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memuat...
                  </>
                ) : user ? (
                  <>
                    Lanjut ke Pembayaran
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Masuk untuk Checkout
                    <LogIn className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleContinueShopping}
                className="w-full border-stone-300 hover:bg-stone-50"
              >
                Lanjut Belanja
              </Button>
            </div>

            {/* Trust Signals & Benefits */}
            <div className="grid grid-cols-1 gap-2 pt-2">
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="text-xs text-green-700 space-y-1">
                  <p className="font-medium text-green-800 mb-1">✅ Jaminan Kualitas</p>
                  <p>• Ampas kopi segar & berkualitas tinggi</p>
                  <p>• Produk ramah lingkungan 100%</p>
                  <p>• Kemasan aman & higienis</p>
                </div>
              </div>
              
              <div className="bg-amber-50 p-2 rounded border border-amber-200">
                <div className="text-xs text-amber-700 space-y-1">
                  <p className="font-medium text-amber-800 mb-1">🔒 Keamanan Transaksi</p>
                  <p>• Pembayaran 100% aman dengan enkripsi SSL</p>
                  <p>• Berbagai metode pembayaran tersedia</p>
                  <p>• Garansi uang kembali jika tidak puas</p>
                </div>
              </div>
              
              <div className="text-xs text-stone-500 text-center pt-2">
                <p>💚 Setiap pembelian membantu mengurangi limbah kopi</p>
              </div>
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