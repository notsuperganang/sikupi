// Currency formatting utilities for Indonesian Rupiah

/**
 * Format number to Indonesian Rupiah currency
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate discount percentage between original and discounted price
 */
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0 || discountedPrice <= 0 || discountedPrice >= originalPrice) {
    return 0
  }
  
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
}

/**
 * Format discount percentage with Indonesian text
 */
export function formatDiscountPercentage(percentage: number): string {
  if (percentage <= 0) return ''
  return `Hemat ${percentage}%`
}

/**
 * Calculate savings amount
 */
export function calculateSavings(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0 || discountedPrice <= 0 || discountedPrice >= originalPrice) {
    return 0
  }
  
  return originalPrice - discountedPrice
}