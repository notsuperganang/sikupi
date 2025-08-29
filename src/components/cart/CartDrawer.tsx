// Cart drawer component using Sheet
'use client'

import React from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { useCartDrawer } from '@/lib/cart-context'
import CartLineItem from './CartLineItem'
import EmptyCart from './EmptyCart'
import FreeShippingStrip from './FreeShippingStrip'
import { ArrowRight } from 'lucide-react'

export default function CartDrawer() {
  const { cart, isLoading, clearCart, isClearing } = useCart()
  const { isDrawerOpen, closeDrawer } = useCartDrawer()
  
  // Debug logging
  React.useEffect(() => {
    console.log('🎭 CartDrawer rendered, isDrawerOpen:', isDrawerOpen)
    console.log('🎭 Full cart state:', { isDrawerOpen, cart: !!cart })
  }, [isDrawerOpen, cart])

  const hasItems = (cart?.items?.length ?? 0) > 0
  const itemCount = cart?.totals?.itemCount ?? 0

  const handleCheckout = () => {
    closeDrawer()
    // Navigate to checkout
    window.location.href = '/checkout'
  }

  const handleViewFullCart = () => {
    closeDrawer()
    // Navigate to full cart page
    window.location.href = '/cart'
  }

  const handleContinueShopping = () => {
    closeDrawer()
  }

  const handleClearCart = () => {
    if (confirm('Yakin ingin mengosongkan keranjang?')) {
      clearCart()
    }
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
      <SheetContent onClose={closeDrawer}>
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-stone-600">Memuat keranjang...</p>
            </div>
          </div>
        ) : hasItems ? (
          /* Cart with Items */
          <div className="flex flex-col h-full">
            {/* Header Actions */}
            <div className="px-4 py-2 border-b">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">
                  {itemCount} item dalam keranjang
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewFullCart}
                    className="text-xs"
                  >
                    Lihat Semua
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    {isClearing ? 'Menghapus...' : 'Kosongkan'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Free Shipping Progress */}
            {cart?.totals && (
              <div className="px-4 py-3">
                <FreeShippingStrip currentTotal={cart.totals.subtotal} />
              </div>
            )}

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-0">
                {cart?.items?.map((item, index) => (
                  <CartLineItem
                    key={`${item.id}-${index}`}
                    item={item}
                  />
                )) ?? []}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t bg-white p-4 space-y-3">
              {/* Quick Summary */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg text-amber-700">
                  {cart?.totals ? `Rp ${cart.totals.total.toLocaleString('id-ID')}` : '-'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
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
                  size="sm"
                >
                  Lanjut Belanja
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="flex items-center justify-center h-full">
            <EmptyCart onContinueShopping={handleContinueShopping} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}