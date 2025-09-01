// Main cart page with RSC and client integration
import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getUser } from '@/lib/supabase'
import { getActiveCart } from '@/server/cart-adapter'
import CartClient from '@/components/cart/CartClient'
import CartPageClient from './CartPageClient'

export const metadata: Metadata = {
  title: 'Keranjang - Sikupi',
  description: 'Lihat dan kelola item dalam keranjang belanja Anda di Sikupi',
  keywords: ['keranjang', 'shopping cart', 'ampas kopi', 'sikupi'],
}

export default async function CartPage() {
  // Get user and initial cart data on server
  let initialCart = null
  let user = null

  try {
    user = await getUser()
    if (user) {
      initialCart = await getActiveCart(user.id)
    }
  } catch (error) {
    console.error('Error loading cart on server:', error)
    // Continue with empty cart - client will handle auth state
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-20 md:pt-24">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-stone-600">
            <Link href="/" className="hover:text-amber-800 transition-colors">
              Home
            </Link>
            <span>›</span>
            <span className="text-amber-800 font-medium">Keranjang</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">Keranjang Belanja</h1>
          <div className="text-sm text-stone-600">
            {initialCart && initialCart.totals.itemCount > 0 && (
              <span>
                {initialCart.totals.itemCount} item dalam keranjang
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cart Content - Client-side hydrated */}
      <CartClient>
        <CartPageClient 
          initialCart={initialCart} 
          initialUser={user} 
        />
      </CartClient>
    </main>
  )
}