'use client'

import React from 'react'
import { formatRupiah } from '@/lib/currency'

interface RelatedProduct {
  id: string
  slug: string
  title: string
  category: string
  price: number
  imageUrl: string | null
  stockQty: number
}

interface RelatedProductsProps {
  products: RelatedProduct[]
  currentProductCategory: string
}

export default function RelatedProducts({ products, currentProductCategory }: RelatedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-16 py-8 border-t border-stone-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Produk Terkait</h2>
        <a
          href={`/products?category=${currentProductCategory}`}
          className="flex items-center space-x-2 text-amber-700 hover:text-amber-800 font-medium transition-colors"
        >
          <span>Lihat Produk Lainnya</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((relatedProduct) => (
          <a
            key={relatedProduct.id}
            href={`/products/${relatedProduct.slug}`}
            className="bg-white rounded-lg border border-stone-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-stone-100 rounded-lg mb-3 overflow-hidden">
              {relatedProduct.imageUrl ? (
                <img
                  src={relatedProduct.imageUrl}
                  alt={relatedProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = '/image-asset/coffee-grounds-others.jpg'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                  <span className="text-stone-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-stone-800 truncate mb-2">
              {relatedProduct.title}
            </h3>
            <p className="text-sm text-amber-800 font-bold">
              {formatRupiah(relatedProduct.price)}
            </p>
            <div className="text-xs text-stone-500 mt-1">
              Stok: {Math.floor(relatedProduct.stockQty)} kg
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}