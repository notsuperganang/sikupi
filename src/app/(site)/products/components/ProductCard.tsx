'use client'

import { ProductImage } from '@/components/ui/fallback-image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Eye, Package, AlertCircle, Sparkles, Recycle, Heart, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle } from '@/components/ui/card-hover-effect'
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

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
  onAddToCart?: (productId: string) => void
  className?: string
}

export function ProductCard({ 
  product, 
  onQuickView, 
  onAddToCart,
  className 
}: ProductCardProps) {
  const CategoryIcon = getCategoryIcon(product.category)
  const stockStatus = getStockStatus(product.stockQty)
  const isNewProduct = isNew(product.createdAt)

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart?.(product.id)
  }

  return (
    <motion.div 
      className={className}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 bg-white border border-[var(--sikupi-primary-200)] hover:border-[var(--sikupi-primary-400)] flex flex-col h-full">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--sikupi-primary-50)' }}>
            <ProductImage
              product={product}
              src={product.imageUrl}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              fallbackSrc="/image-asset/coffee-grounds-others.jpg"
            />
            
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {/* Category badge with enhanced styling */}
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-white/90 backdrop-blur-sm border-0 shadow-sm"
                style={{ color: 'var(--sikupi-primary-800)' }}
              >
                <CategoryIcon className="w-3.5 h-3.5" />
                {categoryTranslations[product.category]}
              </Badge>
            </div>
            
            {/* New badge - moved to right position */}
            {isNewProduct && (
              <div className="absolute top-3 right-3">
                <Badge className="text-white text-xs font-semibold px-2.5 py-1 shadow-md" style={{ backgroundColor: 'var(--sikupi-accent-orange)' }}>
                  Baru
                </Badge>
              </div>
            )}
            
            {/* Enhanced hover overlay with actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleQuickView}
                  className="flex items-center gap-2 bg-white/95 hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm border-0"
                  aria-label={`Lihat produk ${product.title}`}
                >
                  <Eye className="w-4 h-4" />
                  Lihat
                </Button>
                {stockStatus.status !== 'out_of_stock' && (
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 shadow-lg"
                    style={{ backgroundColor: 'var(--sikupi-primary)', borderColor: 'var(--sikupi-primary)' }}
                    aria-label={`Tambah ${product.title} ke keranjang`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Keranjang
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Product Info */}
          <div className="flex flex-col flex-grow p-3 sm:p-4 space-y-2 sm:space-y-3">
            {/* Title */}
            <CardTitle className="text-base sm:text-lg font-bold leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] text-[var(--sikupi-primary-800)] group-hover:text-[var(--sikupi-primary-600)] transition-colors">
              {product.title}
            </CardTitle>

            {/* Enhanced Attributes section */}
            <div className="min-h-[2rem] flex items-center flex-wrap gap-1">
              {/* Coffee-specific attributes (for ampas_kopi) */}
              {product.category === 'ampas_kopi' && (
                <>
                  {product.coffeeType && product.coffeeType !== 'unknown' && (
                    <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-6 flex items-center border-[var(--sikupi-primary-300)] text-[var(--sikupi-primary-700)] bg-[var(--sikupi-primary-50)] hover:bg-[var(--sikupi-primary-100)] transition-colors">
                      {coffeeTypeTranslations[product.coffeeType]}
                    </Badge>
                  )}
                  {product.grindLevel && product.grindLevel !== 'unknown' && (
                    <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-6 flex items-center border-[var(--sikupi-coffee-medium)] text-[var(--sikupi-coffee-dark)] bg-[var(--sikupi-coffee-light)]/20 hover:bg-[var(--sikupi-coffee-light)]/30 transition-colors">
                      {grindLevelTranslations[product.grindLevel]}
                    </Badge>
                  )}
                  {product.condition && product.condition !== 'unknown' && (
                    <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 h-5 sm:h-6 flex items-center border-[var(--sikupi-earth-forest)] text-[var(--sikupi-earth-soil)] bg-[var(--sikupi-earth-sand)]/30 hover:bg-[var(--sikupi-earth-sand)]/50 transition-colors">
                      {conditionTranslations[product.condition]}
                    </Badge>
                  )}
                </>
              )}
              
              {/* Single badge for turunan products - same width as stock section */}
              {product.category !== 'ampas_kopi' && (
                <div className="w-full bg-[var(--sikupi-primary-50)] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--sikupi-primary-700)' }}>
                    {/* Show specific badge based on category */}
                    {product.category === 'scrub' && (
                      <>
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Perawatan Alami</span>
                      </>
                    )}
                    {product.category === 'briket' && (
                      <>
                        <Recycle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Ramah Lingkungan</span>
                      </>
                    )}
                    {product.category === 'pupuk' && (
                      <>
                        <Recycle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Organik Premium</span>
                      </>
                    )}
                    {product.category === 'pulp' && (
                      <>
                        <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Kaya Nutrisi</span>
                      </>
                    )}
                    {product.category === 'pakan_ternak' && (
                      <>
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Berkualitas Tinggi</span>
                      </>
                    )}
                    {(product.category === 'lainnya' || !['scrub', 'briket', 'pupuk', 'pulp', 'pakan_ternak'].includes(product.category)) && (
                      <>
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Kualitas Premium</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Price section with enhanced styling */}
            <div className="space-y-2 sm:space-y-3 mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--sikupi-primary-800)' }}>
                  {formatRupiah(product.price)}
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--sikupi-gray-500)' }}>
                  /kg
                </span>
              </div>

              {/* Enhanced Rating and Sales */}
              <div className="flex items-center justify-between text-xs sm:text-sm bg-[var(--sikupi-primary-50)] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold" style={{ color: 'var(--sikupi-primary-700)' }}>
                    {product.ratingAvg ? product.ratingAvg.toFixed(1) : '-'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--sikupi-gray-500)' }}>
                    ({product.ratingCount || 0})
                  </span>
                </div>
                <div className="font-medium text-xs sm:text-sm" style={{ color: 'var(--sikupi-gray-600)' }}>
                  {product.soldCount || 0} terjual
                </div>
              </div>

              {/* Enhanced Stock quantity */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" style={{ color: 'var(--sikupi-gray-700)' }}>
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{product.stockQty} kg tersedia</span>
                </div>
                
                {stockStatus.status === 'out_of_stock' && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm font-medium" style={{ color: 'var(--sikupi-accent-red)' }}>
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Habis</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

// Grid wrapper component that uses ACETERNITY HoverEffect
interface ProductCardGridProps {
  products: Product[]
  onQuickView?: (product: Product) => void
  onAddToCart?: (productId: string) => void
  className?: string
}

export function ProductCardGrid({
  products,
  onQuickView,
  onAddToCart,
  className
}: ProductCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
          className={className}
        />
      ))}
    </div>
  )
}