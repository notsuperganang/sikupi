// Image handling utilities for product images

/**
 * Default fallback image path for product images
 */
export const DEFAULT_PRODUCT_IMAGE = '/image-asset/coffee-grounds-others.jpg'

/**
 * Handle image error by setting fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.target as HTMLImageElement
  if (img.src !== DEFAULT_PRODUCT_IMAGE) {
    img.src = DEFAULT_PRODUCT_IMAGE
  }
}

/**
 * Get fallback image URL based on product category
 */
export function getFallbackImage(category?: string): string {
  // You can extend this to have category-specific fallbacks
  switch (category) {
    case 'ampas_kopi':
      return '/image-asset/coffee-grounds-others.jpg'
    default:
      return DEFAULT_PRODUCT_IMAGE
  }
}

/**
 * Validate if string is a valid URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  try {
    const urlObj = new URL(url)
    // Allow URLs that look like image URLs or have image extensions
    // This is more permissive for cases where URLs might not have clear extensions
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(urlObj.pathname)
    const looksLikeImage = /\/image|\/img|\/photo|unsplash|pixabay|pexels/i.test(url)
    
    return hasImageExtension || looksLikeImage || url.startsWith('https://') || url.startsWith('http://')
  } catch {
    return false
  }
}

/**
 * Transform image URLs array to image objects with fallback
 */
export function transformImageUrls(urls: string[] | null, category?: string): Array<{ url: string; alt?: string }> {
  if (!urls || urls.length === 0) {
    return [{ url: getFallbackImage(category), alt: 'Product image' }]
  }
  
  const validImages = urls
    .filter(url => url && isValidImageUrl(url))
    .map(url => ({ url, alt: 'Product image' }))
  
  // If no valid images found, return fallback
  if (validImages.length === 0) {
    return [{ url: getFallbackImage(category), alt: 'Product image' }]
  }
  
  return validImages
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getImageProps(src: string, alt: string = 'Product image') {
  return {
    src: src || DEFAULT_PRODUCT_IMAGE,
    alt,
    onError: handleImageError,
    quality: 85,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknymiLogqNvzegA/Oi+IARVBZKjUBa7y1a4Q9tE=',
  }
}