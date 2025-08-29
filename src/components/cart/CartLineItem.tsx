// Individual cart line item with quantity controls
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/currency'
import { getImageProps } from '@/lib/images'
import { useCart, getQuantityLimits } from '@/hooks/useCart'
import type { CartItemWithProduct } from '@/server/cart-adapter'

interface CartLineItemProps {
  item: CartItemWithProduct
  onRemove?: () => void
}

export default function CartLineItem({ item, onRemove }: CartLineItemProps) {
  const { updateQuantity, removeItem, isUpdating, isRemoving } = useCart()
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Get quantity limits based on product category (assume ampas_kopi for coffee products)
  const limits = getQuantityLimits('ampas_kopi') // Default to ampas_kopi limits
  
  const imageUrl = item.image_urls?.[0] || '/image-asset/coffee-grounds-others.jpg'
  const imageProps = getImageProps(imageUrl, item.product_title)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < limits.min || newQuantity > limits.max) return
    if (newQuantity > item.stock_qty) {
      // Show stock warning but don't prevent update - let server validate
      console.warn(`Requested quantity ${newQuantity} exceeds stock ${item.stock_qty}`)
    }
    
    updateQuantity({ itemId: item.id, quantity: newQuantity })
  }

  const handleRemove = () => {
    if (showConfirmDelete) {
      removeItem(item.id)
      onRemove?.()
      setShowConfirmDelete(false)
    } else {
      setShowConfirmDelete(true)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirmDelete(false), 3000)
    }
  }

  const canDecrease = item.quantity > limits.min
  const canIncrease = item.quantity < limits.max && item.quantity < item.stock_qty
  
  return (
    <div className="flex items-start gap-3 p-4 border-b border-stone-200">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-100">
          <Image
            src={imageProps.src}
            alt={imageProps.alt}
            fill
            className="object-cover"
            sizes="56px"
            onError={imageProps.onError}
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-stone-900 line-clamp-2">
              {item.product_title}
            </h3>
            
            {/* Product attributes */}
            <div className="flex flex-wrap gap-1 mt-1">
              {item.coffee_type && item.coffee_type !== 'unknown' && (
                <Badge variant="secondary" className="text-xs px-1 py-0 h-5">
                  {item.coffee_type}
                </Badge>
              )}
              {item.grind_level && item.grind_level !== 'unknown' && (
                <Badge variant="secondary" className="text-xs px-1 py-0 h-5">
                  {item.grind_level}
                </Badge>
              )}
              {item.condition && item.condition !== 'unknown' && (
                <Badge variant="secondary" className="text-xs px-1 py-0 h-5">
                  {item.condition}
                </Badge>
              )}
            </div>

            {/* Price per unit */}
            <p className="text-sm text-stone-600 mt-1">
              {formatRupiah(item.price_idr)}/{item.unit}
            </p>

            {/* Stock warning */}
            {item.quantity > item.stock_qty && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Melebihi stok tersedia ({item.stock_qty} {item.unit})
              </p>
            )}
          </div>

          {/* Remove button */}
          <Button
            variant={showConfirmDelete ? "destructive" : "outline"}
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-1 h-8 w-8 flex-shrink-0"
            aria-label={showConfirmDelete ? "Konfirmasi hapus item" : "Hapus item"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity - limits.step)}
              disabled={!canDecrease || isUpdating}
              className="p-1 h-8 w-8"
              aria-label={`Kurangi jumlah ${item.product_title}`}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="text-sm font-medium min-w-[3ch] text-center">
              {item.quantity}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity + limits.step)}
              disabled={!canIncrease || isUpdating}
              className="p-1 h-8 w-8"
              aria-label={`Tambah jumlah ${item.product_title}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
            
            <span className="text-xs text-stone-500 ml-1">
              {item.unit}
            </span>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="font-semibold text-sm text-stone-900">
              {formatRupiah(item.subtotal_idr)}
            </p>
          </div>
        </div>

        {/* Confirm delete message */}
        {showConfirmDelete && (
          <p className="text-xs text-red-600 mt-2">
            Klik sekali lagi untuk menghapus
          </p>
        )}
      </div>
    </div>
  )
}