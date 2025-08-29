'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag, MapPin, Truck, Package } from 'lucide-react'
import { formatRupiah } from '@/lib/currency'
import { FallbackImage } from '@/components/ui/fallback-image'
import type { ShippingAddress, SelectedCourier } from '../CheckoutPageClient'
import type { CartItemWithProduct, CartTotals } from '@/server/cart-adapter'

interface OrderSummaryProps {
  items: CartItemWithProduct[]
  totals: CartTotals
  selectedCourier?: SelectedCourier | null
  shippingAddress?: ShippingAddress | null
}

export default function OrderSummary({
  items,
  totals,
  selectedCourier,
  shippingAddress
}: OrderSummaryProps) {
  const finalTotal = totals.subtotal - totals.discount + (selectedCourier?.price || 0)

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold">Pesanan Anda ({items.length})</h3>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <FallbackImage
                  src={item.image_urls?.[0] || ''}
                  alt={item.product_title}
                  className="w-12 h-12 object-cover rounded-lg bg-stone-100"
                  width={48}
                  height={48}
                  fallback={
                    <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-stone-400" />
                    </div>
                  }
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-stone-900 line-clamp-2">
                  {item.product_title}
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  {item.quantity} {item.unit} × {formatRupiah(item.price_idr)}
                </p>
                <p className="text-sm font-medium text-amber-700 mt-1">
                  {formatRupiah(item.subtotal_idr)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Shipping Address */}
      {shippingAddress && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Alamat Pengiriman</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="font-medium text-stone-900">
              {shippingAddress.recipient_name}
            </p>
            <p className="text-stone-600">
              {shippingAddress.phone}
            </p>
            <p className="text-stone-600">
              {shippingAddress.address}
            </p>
            <p className="text-stone-600">
              {shippingAddress.city}, {shippingAddress.postal_code}
            </p>
            {shippingAddress.notes && (
              <p className="text-xs text-stone-500 italic">
                Catatan: {shippingAddress.notes}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Selected Courier */}
      {selectedCourier && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Pengiriman</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-stone-900 uppercase">
                  {selectedCourier.company}
                </p>
                <p className="text-sm text-stone-600">
                  {selectedCourier.service_name}
                </p>
                <p className="text-xs text-stone-500">
                  Estimasi: {selectedCourier.duration}
                </p>
              </div>
              <p className="font-semibold text-amber-700">
                {formatRupiah(selectedCourier.price)}
              </p>
            </div>
            
            {selectedCourier.description && (
              <p className="text-xs text-stone-500 pt-2 border-t border-stone-200">
                {selectedCourier.description}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Price Breakdown */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Ringkasan Pembayaran</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">
              Subtotal ({totals.itemCount} item)
            </span>
            <span className="font-medium">
              {formatRupiah(totals.subtotal)}
            </span>
          </div>
          
          {totals.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Diskon</span>
              <span>-{formatRupiah(totals.discount)}</span>
            </div>
          )}
          
          {selectedCourier ? (
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Ongkir</span>
              <span className="font-medium">
                {formatRupiah(selectedCourier.price)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-sm text-stone-400">
              <span>Ongkir</span>
              <span>Pilih kurir dulu</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-base">
            <span className="text-stone-900">Total</span>
            <span className="text-amber-700">
              {formatRupiah(finalTotal)}
            </span>
          </div>
        </div>
      </Card>

      {/* Trust Signals */}
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-green-700 space-y-1">
            <p className="font-medium text-green-800 mb-1">
              ✅ Jaminan Kualitas
            </p>
            <p>• Ampas kopi segar & berkualitas tinggi</p>
            <p>• Produk ramah lingkungan 100%</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-medium text-blue-800 mb-1">
              🔒 Pembayaran Aman
            </p>
            <p>• Diproses melalui Midtrans</p>
            <p>• Enkripsi SSL 256-bit</p>
          </div>
        </div>
      </div>
    </div>
  )
}