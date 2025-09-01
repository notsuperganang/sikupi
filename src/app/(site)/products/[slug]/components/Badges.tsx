import { Badge } from '@/components/ui/badge'
import { getCategoryIcon, categoryTranslations, coffeeTypeTranslations, grindLevelTranslations, conditionTranslations, isNew } from '@/lib/products'
import { Coffee, Sparkles } from 'lucide-react'
import type { ProductDetail } from '../page'

interface BadgesProps {
  product: ProductDetail
}

export default function Badges({ product }: BadgesProps) {
  const CategoryIcon = getCategoryIcon(product.category)
  const isProductNew = isNew(product.createdAt)

  return (
    <div className="flex flex-wrap gap-2">
      {/* New Product Badge */}
      {isProductNew && (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <Sparkles className="w-3 h-3 mr-1" />
          Baru
        </Badge>
      )}

      {/* Category Badge */}
      <Badge variant="outline" className="border-amber-200 text-amber-800">
        <CategoryIcon className="w-3 h-3 mr-1" />
        {categoryTranslations[product.category]}
      </Badge>

      {/* Coffee-specific badges (only for ampas_kopi category) */}
      {product.category === 'ampas_kopi' && (
        <>
          {product.coffeeType && product.coffeeType !== 'unknown' && (
            <Badge variant="outline" className="border-amber-200 text-amber-700">
              <Coffee className="w-3 h-3 mr-1" />
              {coffeeTypeTranslations[product.coffeeType]}
            </Badge>
          )}
          
          {product.grindLevel && product.grindLevel !== 'unknown' && (
            <Badge variant="outline" className="border-stone-200 text-stone-700">
              {grindLevelTranslations[product.grindLevel]}
            </Badge>
          )}
          
          {product.condition && product.condition !== 'unknown' && (
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              {conditionTranslations[product.condition]}
            </Badge>
          )}
        </>
      )}

      {/* Product Kind Badge */}
      <Badge 
        variant={product.kind === 'ampas' ? 'default' : 'secondary'} 
        className={
          product.kind === 'ampas' 
            ? "bg-amber-600 text-white" 
            : "bg-stone-100 text-stone-700"
        }
      >
        {product.kind === 'ampas' ? 'Ampas Kopi' : 'Produk Turunan'}
      </Badge>
    </div>
  )
}