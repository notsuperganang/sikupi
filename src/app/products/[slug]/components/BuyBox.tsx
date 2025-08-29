'use client'

import { useState } from 'react'
import { Star, Plus, Minus, Heart, Share2, ShoppingCart, Zap, MapPin, CreditCard, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatRupiah, calculateDiscountPercentage, formatDiscountPercentage } from '@/lib/currency'
import { getStarStates, formatRating } from '@/lib/rating'
import { getStockStatus } from '@/lib/products'
import { cn } from '@/lib/utils'
import Badges from './Badges'
import ShippingStrip from './ShippingStrip'
import type { ProductDetail } from '../page'

interface BuyBoxProps {
  product: ProductDetail
}

export default function BuyBox({ product }: BuyBoxProps) {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const stockStatus = getStockStatus(product.stockQty)
  const isInStock = stockStatus.status !== 'out_of_stock'
  const discountPercentage = product.compareAtPrice ? calculateDiscountPercentage(product.compareAtPrice, product.price) : 0
  
  // Set quantity limits based on product category
  const getMaxQuantity = () => {
    if (product.category === 'ampas_kopi') {
      // For ampas, max 50kg but limited by stock
      return Math.min(product.stockQty, 50)
    } else {
      // For lainnya category, max 1kg (which is the unit size)
      return Math.min(product.stockQty, 1)
    }
  }
  
  const maxQuantity = getMaxQuantity()
  
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    // Mock toast notification
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('showToast', {
        detail: {
          message: isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist',
          type: 'info'
        }
      })
      window.dispatchEvent(event)
    }
  }

  const handleShare = async () => {
    if (navigator.share && typeof window !== 'undefined') {
      try {
        await navigator.share({
          title: product.title,
          text: `Lihat ${product.title} di Sikupi`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copy to clipboard
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Link produk disalin ke clipboard',
          type: 'success'
        }
      })
      window.dispatchEvent(event)
    }
  }

  const handleAddToCart = () => {
    // Mock add to cart functionality
    const event = new CustomEvent('showToast', {
      detail: {
        message: `${quantity} ${product.title} ditambahkan ke keranjang`,
        type: 'success'
      }
    })
    window.dispatchEvent(event)
  }

  const handleBuyNow = () => {
    // Mock buy now functionality
    const event = new CustomEvent('showToast', {
      detail: {
        message: 'Mengarahkan ke checkout...',
        type: 'info'
      }
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 mb-2">
          {product.title}
        </h1>
        
        {/* Rating and Sales */}
        <div className="flex items-center space-x-4 text-sm">
          {product.ratingAvg && product.ratingAvg > 0 ? (
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {getStarStates(product.ratingAvg).map((state, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "w-4 h-4",
                      state === 'full' ? "fill-amber-400 text-amber-400" : 
                      state === 'half' ? "fill-amber-400 text-amber-400" : "text-stone-300"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium text-stone-700">
                {formatRating(product.ratingAvg)}
              </span>
              <span className="text-stone-500">
                ({product.ratingCount || 0} ulasan)
              </span>
            </div>
          ) : (
            <span className="text-stone-500">Belum ada ulasan</span>
          )}
          
          {product.soldCount && product.soldCount > 0 && (
            <>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">{product.soldCount} terjual</span>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <Badges product={product} />

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-end space-x-3">
          <div className="text-3xl font-bold text-amber-800">
            {formatRupiah(product.price)}
          </div>
          
          {product.compareAtPrice && discountPercentage > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-lg text-stone-500 line-through">
                {formatRupiah(product.compareAtPrice)}
              </div>
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                {formatDiscountPercentage(discountPercentage)}
              </Badge>
            </div>
          )}
        </div>
        
        {product.weightGram && (
          <p className="text-sm text-stone-600">
            Berat bersih: {Math.round(product.weightGram)}g
          </p>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        <div className={cn("px-2 py-1 rounded text-sm font-medium border", stockStatus.colorClass)}>
          {stockStatus.label}
        </div>
        {product.stockQty > 0 && product.stockQty <= 10 && (
          <span className="text-sm text-stone-600">
            {product.stockQty} tersisa
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      {isInStock && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Kuantitas:</label>
          <div className="flex items-center space-x-3">
            <div className="flex items-center border border-stone-300 rounded">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                aria-label="Kurangi kuantitas"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="w-16 text-center text-sm font-medium">
                {quantity}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxQuantity}
                aria-label="Tambah kuantitas"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-sm text-stone-600">
              Max {maxQuantity} kg
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {isInStock ? (
          <>
            <Button
              onClick={handleBuyNow}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 text-base"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Beli Langsung
            </Button>
            
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 font-medium py-3 text-base"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              + Keranjang
            </Button>
          </>
        ) : (
          <Button
            disabled
            className="w-full py-3 text-base"
            size="lg"
          >
            Stok Habis
          </Button>
        )}

        {/* Secondary Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("w-4 h-4 mr-2", isWishlisted && "fill-red-500 text-red-500")} />
            Wishlist
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Bagikan
          </Button>
        </div>
      </div>

      <Separator />

      {/* Shipping and Payment Info */}
      <ShippingStrip />

      <Separator />

      {/* Additional Features */}
      <div className="space-y-3">
        {/* Location */}
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-stone-500" />
          <span className="text-stone-600">Tersedia untuk pengiriman</span>
          <span className="font-medium text-stone-800">
            {product.origin || 'Banda Aceh'}
          </span>
        </div>

        {/* Mock Features */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-stone-600">
            <Gift className="w-4 h-4 text-amber-600" />
            <span>Cashback 2% untuk pembelian pertama</span>
          </div>
          
          <div className="flex items-center space-x-2 text-stone-600">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Cicilan mulai Rp {formatRupiah(Math.floor(product.price / 12)).replace('Rp ', '')}/bulan</span>
          </div>
        </div>
      </div>
    </div>
  )
}