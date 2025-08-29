// Client-side cart page component
'use client'

import React from 'react'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/hooks/useCart'
import CartLineItem from '@/components/cart/CartLineItem'
import CartSummary from '@/components/cart/CartSummary'
import EmptyCart from '@/components/cart/EmptyCart'
import FreeShippingStrip from '@/components/cart/FreeShippingStrip'
import VoucherInput from '@/components/cart/VoucherInput'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import type { Cart } from '@/server/cart-adapter'

interface CartPageClientProps {
  initialCart: Cart | null
  initialUser: any | null
}

function CartPageContent({ initialCart, initialUser }: { initialCart: Cart | null; initialUser: any | null }) {
  const { cart, isLoading, clearCart, isClearing } = useCart()
  const queryClient = useQueryClient()

  // Use server data if available, otherwise use client data
  const displayCart = cart || initialCart
  const hasItems = (displayCart?.items?.length ?? 0) > 0
  const itemCount = displayCart?.totals?.itemCount ?? 0

  const handleClearCart = () => {
    if (confirm('Yakin ingin mengosongkan keranjang? Tindakan ini tidak dapat dibatalkan.')) {
      clearCart()
    }
  }

  const handleBackToProducts = () => {
    window.location.href = '/products'
  }

  // Hydrate initial data if available
  React.useEffect(() => {
    if (initialCart && !cart) {
      // Pre-populate the query cache with initial data
      queryClient.setQueryData(['cart', initialUser?.id || 'guest'], initialCart)
    }
  }, [initialCart, cart, queryClient, initialUser])

  if (isLoading && !displayCart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-stone-600">Memuat keranjang...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <EmptyCart />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-stone-900">
                  Item dalam Keranjang ({itemCount})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isClearing ? 'Menghapus...' : 'Kosongkan Keranjang'}
                </Button>
              </div>
            </div>

            {/* Free Shipping Progress */}
            {displayCart?.totals && (
              <div className="p-4 bg-stone-50 border-b border-stone-200">
                <FreeShippingStrip currentTotal={displayCart.totals.subtotal} />
              </div>
            )}

            {/* Cart Items */}
            <div className="divide-y divide-stone-200 bg-white">
              {displayCart?.items?.map((item, index) => (
                <CartLineItem
                  key={`${item.id}-${index}`}
                  item={item}
                />
              ))}
            </div>
          </Card>

          {/* Back to Products */}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleBackToProducts}
              className="flex items-center gap-2 hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Lanjut Belanja
            </Button>
          </div>
        </div>

        {/* Right: Summary & Actions */}
        <div className="space-y-6">
          {/* Voucher Input */}
          <Card className="p-4">
            <VoucherInput />
          </Card>

          {/* Cart Summary */}
          {displayCart?.totals && (
            <CartSummary
              totals={displayCart.totals}
              itemCount={itemCount}
            />
          )}

          {/* Additional Info */}
          <Card className="p-4">
            <h3 className="font-medium text-stone-900 mb-3">Informasi Tambahan</h3>
            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Kemasan aman dan terjamin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Produk ramah lingkungan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Garansi kepuasan pelanggan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Customer service 24/7</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Create a query client for this component
const cartQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export default function CartPageClient({ initialCart, initialUser }: CartPageClientProps) {
  return (
    <QueryClientProvider client={cartQueryClient}>
      <CartPageContent initialCart={initialCart} initialUser={initialUser} />
    </QueryClientProvider>
  )
}