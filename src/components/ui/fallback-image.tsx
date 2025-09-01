'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface FallbackImageProps {
  src: string | string[] | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  fallbackSrc?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

// Default coffee-related placeholder image (simple SVG data URL)
const DEFAULT_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwQzE3Mi4zODYgMTAwIDE1MCA5MS4wNDU3IDE1MCA4MC41QzE1MCA2OS45NTQzIDE3Mi4zODYgNjEgMjAwIDYxQzIyNy42MTQgNjEgMjUwIDY5Ljk1NDMgMjUwIDgwLjVDMjUwIDkxLjA0NTcgMjI3LjYxNCAxMDAgMjAwIDEwMFoiIGZpbGw9IiM5Q0E3QjciLz4KPHA+Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjgwIiBmaWxsPSIjNkI3MjgwIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iNjAiIGZpbGw9IiM0QjU1NjMiLz4KPHA+dGV4dCB4PSIyMDAiIHk9IjMzMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPktvcGkgU2lrdXBpPC90ZXh0Pgo8L3N2Zz4K"

// Generate a simple colored placeholder
const generatePlaceholder = (seed: string, width = 400, height = 400) => {
  // Simple hash to generate consistent colors
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  const hue = Math.abs(hash) % 360
  const bgColor = `hsl(${hue}, 20%, 92%)`
  const iconColor = `hsl(${hue}, 30%, 60%)`
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <circle cx="${width/2}" cy="${height/2}" r="40" fill="${iconColor}" opacity="0.3"/>
      <circle cx="${width/2}" cy="${height/2}" r="20" fill="${iconColor}" opacity="0.5"/>
    </svg>
  `)}`
}

export function FallbackImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  priority = false,
  fill = false,
  sizes,
  fallbackSrc,
  placeholder,
  blurDataURL,
  ...props 
}: FallbackImageProps) {
  const [imageError, setImageError] = useState(false)
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0)
  
  // Handle multiple sources (array of URLs)
  const sources = Array.isArray(src) ? src : src ? [src] : []
  const currentSrc = sources[currentSrcIndex]
  
  const handleImageError = () => {
    // Try next source in array
    if (currentSrcIndex < sources.length - 1) {
      setCurrentSrcIndex(prev => prev + 1)
      return
    }
    
    // All sources failed, show fallback
    setImageError(true)
  }
  
  // If no valid source or all sources failed
  if (!currentSrc || imageError) {
    const placeholderSrc = fallbackSrc || generatePlaceholder(alt, width, height)
    
    return (
      <div 
        className={`relative flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
        {...(fill && { style: { position: 'absolute', inset: 0 } })}
      >
        <Image
          src={placeholderSrc}
          alt={`${alt} (placeholder)`}
          width={width}
          height={height}
          className={className}
          priority={priority}
          fill={fill}
          sizes={sizes}
          onError={() => {
            // Last resort: show icon
            console.warn('Fallback image also failed:', placeholderSrc)
          }}
        />
      </div>
    )
  }
  
  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      fill={fill}
      sizes={sizes}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={handleImageError}
      {...props}
    />
  )
}

// Utility component for product images specifically
interface ProductImageProps extends Omit<FallbackImageProps, 'alt'> {
  product?: {
    id?: number | string
    title?: string
    image_urls?: string[] | string | null
  }
  alt?: string
}

export function ProductImage({ 
  product, 
  src, 
  alt, 
  ...props 
}: ProductImageProps) {
  // Use product image URLs or provided src
  const imageSrc = src || product?.image_urls
  const imageAlt = alt || product?.title || 'Product image'
  const seedForPlaceholder = product?.id?.toString() || imageAlt
  
  return (
    <FallbackImage
      src={imageSrc}
      alt={imageAlt}
      fallbackSrc={generatePlaceholder(seedForPlaceholder, props.width, props.height)}
      {...props}
    />
  )
}

export default FallbackImage