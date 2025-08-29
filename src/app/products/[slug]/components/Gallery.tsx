'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImageProps } from '@/lib/images'
import type { ProductDetail } from '../page'

interface GalleryProps {
  product: ProductDetail
}

export default function Gallery({ product }: GalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = product.images

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  const currentImage = images[currentImageIndex]

  // Safety check to prevent errors if images array is empty or currentImage is undefined
  if (!images.length || !currentImage) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center">
          <p className="text-stone-500">No image available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square bg-white rounded-lg border border-stone-200 overflow-hidden group">
        <Image
          {...getImageProps(currentImage.url, `${product.title} - Image ${currentImageIndex + 1}`)}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={currentImageIndex === 0}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={previousImage}
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
              aria-label="Gambar selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Zoom Indicator */}
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <ZoomIn className="w-3 h-3" />
          <span>Zoom</span>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                index === currentImageIndex
                  ? 'border-amber-500 ring-2 ring-amber-500 ring-offset-2'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
              onClick={() => selectImage(index)}
              onKeyDown={(e) => handleKeyDown(e, () => selectImage(index))}
              aria-label={`Pilih gambar ${index + 1}`}
              tabIndex={0}
            >
              <Image
                {...getImageProps(image.url, `${product.title} - Thumbnail ${index + 1}`)}
                fill
                sizes="64px"
                className="object-cover"
              />
              
              {/* Selected indicator */}
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Info */}
      <div className="text-center text-sm text-stone-500">
        <p>Klik gambar untuk memperbesar</p>
        {images.length > 1 && (
          <p className="mt-1">Gunakan panah atau thumbnail untuk navigasi</p>
        )}
      </div>
    </div>
  )
}