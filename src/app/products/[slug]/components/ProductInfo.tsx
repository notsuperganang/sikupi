import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Package, MapPin, Building2, Scale, Coffee, Leaf } from 'lucide-react'
import { categoryTranslations, coffeeTypeTranslations, grindLevelTranslations, conditionTranslations } from '@/lib/products'
import { formatWeight } from '@/lib/utils'
import type { ProductDetail } from '../page'

interface ProductInfoProps {
  product: ProductDetail
}

export default function ProductInfo({ product }: ProductInfoProps) {
  // Build specification items
  const specifications = [
    {
      icon: Package,
      label: 'Kategori',
      value: categoryTranslations[product.category]
    },
    ...(product.brand ? [{
      icon: Building2,
      label: 'Brand',
      value: product.brand
    }] : []),
    ...(product.origin ? [{
      icon: MapPin,
      label: 'Asal',
      value: product.origin
    }] : []),
    ...(product.weightGram ? [{
      icon: Scale,
      label: 'Berat Bersih',
      value: formatWeight(product.weightGram / 1000, 'kg')
    }] : []),
    // Coffee-specific specs only for ampas_kopi category
    ...(product.category === 'ampas_kopi' && product.coffeeType && product.coffeeType !== 'unknown' ? [{
      icon: Coffee,
      label: 'Jenis Kopi',
      value: coffeeTypeTranslations[product.coffeeType]
    }] : []),
    ...(product.category === 'ampas_kopi' && product.grindLevel && product.grindLevel !== 'unknown' ? [{
      icon: Coffee,
      label: 'Tingkat Giling',
      value: grindLevelTranslations[product.grindLevel]
    }] : []),
    ...(product.category === 'ampas_kopi' && product.condition && product.condition !== 'unknown' ? [{
      icon: Leaf,
      label: 'Kondisi',
      value: conditionTranslations[product.condition]
    }] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Product Specifications */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          Informasi Produk
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specifications.map((spec, index) => {
            const IconComponent = spec.icon
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-stone-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-600">
                    {spec.label}
                  </div>
                  <div className="text-sm text-stone-900">
                    {spec.value}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Short Specs as Pills */}
        {product.shortSpecs && product.shortSpecs.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-stone-800">Spesifikasi Singkat:</h3>
              <div className="flex flex-wrap gap-2">
                {product.shortSpecs.map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Product Description */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          Deskripsi
        </h2>
        
        {product.description ? (
          <div className="prose prose-stone max-w-none">
            <div className="text-stone-700 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        ) : (
          <p className="text-stone-500 italic">
            Deskripsi produk tidak tersedia.
          </p>
        )}

        {/* Coffee-specific recommendations */}
        {product.category === 'ampas_kopi' && (
          <>
            <Separator className="my-6" />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                <Coffee className="w-4 h-4 mr-2" />
                Cara Pakai & Rekomendasi
              </h3>
              <div className="text-sm text-amber-800 space-y-2">
                <p>• Cocok untuk kompos, pupuk organik, atau bahan campuran media tanam</p>
                <p>• Dapat digunakan untuk scrub alami (jika halus) atau bahan dasar briket</p>
                <p>• Simpan di tempat kering dan sejuk untuk menjaga kualitas</p>
                <p>• Pastikan produk sudah kering sebelum penggunaan jangka panjang</p>
              </div>
            </div>
          </>
        )}

        {/* Sustainability Note */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            Komitmen Keberlanjutan
          </h3>
          <p className="text-sm text-green-800">
            Produk ini merupakan bagian dari upaya daur ulang limbah kopi untuk mendukung ekonomi sirkular 
            dan mengurangi dampak lingkungan. Dengan membeli produk ini, Anda turut berkontribusi dalam 
            gerakan zero waste dan pemberdayaan petani kopi lokal.
          </p>
        </div>
      </Card>
    </div>
  )
}