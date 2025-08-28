'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  X, 
  ShoppingCart, 
  Star, 
  Package, 
  AlertCircle, 
  Coffee,
  Plus,
  Minus,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  formatRupiah, 
  getCategoryIcon, 
  getStockStatus, 
  isNew,
  categoryTranslations,
  coffeeTypeTranslations,
  grindLevelTranslations,
  conditionTranslations
} from '@/lib/products'
import type { Product } from '@/lib/products'

interface ProductQuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (productId: string, quantity: number) => void
  className?: string
}

export function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductQuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && product) {
      // Save the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset'
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, product])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setImageError(false)
    }
  }, [isOpen])

  if (!isOpen || !product) {
    return null
  }

  const CategoryIcon = getCategoryIcon(product.category)
  const stockStatus = getStockStatus(product.stockQty)
  const isNewProduct = isNew(product.createdAt)
  const maxQuantity = Math.min(product.stockQty, 10) // Limit to 10 or stock quantity

  const handleImageError = () => {
    setImageError(true)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (onAddToCart && stockStatus.status !== 'out_of_stock') {
      onAddToCart(product.id, quantity)
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!product) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 backdrop-blur-sm bg-black/50' : 'opacity-0 pointer-events-none bg-black/0'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className={`bg-stone-50 dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        style={{ backgroundColor: '#fafaf9' }}
        tabIndex={-1}
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold">
            Preview Produk
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Product Image - Equal width on desktop */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 dark:bg-gray-800">
                <Image
                  src={imageError ? '/image-asset/coffee-grounds-others.jpg' : (product.imageUrl || '/image-asset/coffee-grounds-others.jpg')}
                  alt={product.title}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-amber-900">
                    <CategoryIcon className="w-3 h-3" />
                    {categoryTranslations[product.category]}
                  </Badge>
                  
                  {isNewProduct && (
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                      Baru
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details - Equal width on desktop */}
            <div className="space-y-4 flex flex-col min-h-[400px]">
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-amber-900 dark:text-gray-100 mb-2 break-words">
                    {product.title}
                  </h3>
                
                {/* Coffee-specific attributes */}
                {product.category === 'ampas_kopi' && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.coffeeType && product.coffeeType !== 'unknown' && (
                      <Badge variant="outline" className="flex items-center gap-1 border-amber-300 text-amber-700 bg-amber-50">
                        <Coffee className="w-3 h-3" />
                        {coffeeTypeTranslations[product.coffeeType]}
                      </Badge>
                    )}
                    {product.grindLevel && product.grindLevel !== 'unknown' && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                        {grindLevelTranslations[product.grindLevel]}
                      </Badge>
                    )}
                    {product.condition && product.condition !== 'unknown' && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                        {conditionTranslations[product.condition]}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Description */}
                {product.shortDescription && (
                  <p 
                    id="modal-description" 
                    className="text-stone-600 dark:text-gray-400 text-sm leading-relaxed"
                  >
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="text-2xl font-bold text-amber-900 dark:text-gray-100">
                  {formatRupiah(product.price)}
                  <span className="text-sm font-normal text-stone-500 ml-2">
                    per kg
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-stone-700">
                    {product.ratingAvg ? product.ratingAvg.toFixed(1) : '-'}
                  </span>
                  <span className="text-stone-500 text-sm">
                    ({product.ratingCount || 0} ulasan)
                  </span>
                </div>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600 dark:text-gray-400 text-sm">
                  {product.soldCount || 0} terjual
                </span>
              </div>

              {/* Stock Info */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-stone-500" />
                <span className="text-stone-600 dark:text-gray-400">
                  {product.stockQty} kg tersedia
                </span>
                {stockStatus.status === 'low_stock' && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Stok terbatas
                  </Badge>
                )}
              </div>

              {/* Quantity and Add to Cart - Fixed at bottom */}
              <div className="mt-auto pt-4">
                {stockStatus.status !== 'out_of_stock' ? (
                  <div className="space-y-4 border-t border-stone-200 pt-4">
                    {/* Quantity Selector */}
                    <div className="space-y-2">
                      <label htmlFor="quantity" className="text-sm font-medium text-stone-700">
                        Jumlah (kg)
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          aria-label="Kurangi jumlah"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <input
                          id="quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          min="1"
                          max={maxQuantity}
                          className="w-16 text-center border border-amber-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          aria-label={`Jumlah: ${quantity} kg`}
                        />
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= maxQuantity}
                          aria-label="Tambah jumlah"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        
                        <span className="text-xs text-stone-500 ml-2">
                          Maks. {maxQuantity} kg
                        </span>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="bg-stone-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-600 dark:text-gray-400">
                          Total ({quantity} kg)
                        </span>
                        <span className="font-semibold text-lg text-amber-900">
                          {formatRupiah(product.price * quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button 
                      onClick={handleAddToCart}
                      className="w-full flex items-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-800 hover:from-amber-800 hover:to-yellow-900 text-white"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Tambah ke Keranjang
                    </Button>
                    
                    {/* View full product link */}
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      asChild
                    >
                      <a 
                        href={`/products/${product.slug || product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lihat Halaman Produk Lengkap
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="border-t border-stone-200 pt-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Stok habis</span>
                    </div>
                    <Button disabled className="w-full bg-stone-300 text-stone-500 mb-4" size="lg">
                      Tidak tersedia
                    </Button>
                    
                    {/* View full product link for out of stock */}
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      asChild
                    >
                      <a 
                        href={`/products/${product.slug || product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lihat Halaman Produk Lengkap
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}