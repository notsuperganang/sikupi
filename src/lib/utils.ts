import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting for Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Weight formatting
export function formatWeight(weight: number, unit: string = 'kg'): string {
  return `${weight.toLocaleString('id-ID')} ${unit}`
}

// Date formatting for Indonesian locale
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Generate SKU
export function generateSKU(prefix: string = 'SKU'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}-${timestamp}-${random}`.toUpperCase()
}

// Image URL validation and processing
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname)
  } catch {
    return false
  }
}

// Calculate shipping weight in grams (Biteship expects grams)
export function convertKgToGrams(kg: number): number {
  return Math.ceil(kg * 1000)
}

// Order ID generation
export function generateOrderId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORD-${timestamp}-${random}`
}

// Status translations for Indonesian UI
export const orderStatusTranslations = {
  new: 'Baru',
  pending_payment: 'Menunggu Pembayaran', 
  paid: 'Dibayar',
  packed: 'Dikemas',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
} as const

export const productCategoryTranslations = {
  ampas_kopi: 'Ampas Kopi',
  briket: 'Briket',
  pulp: 'Pulp',
  scrub: 'Scrub',
  pupuk: 'Pupuk',
  pakan_ternak: 'Pakan Ternak',
  lainnya: 'Lainnya',
} as const

export const coffeeTypeTranslations = {
  arabika: 'Arabika',
  robusta: 'Robusta',
  mix: 'Campuran',
  unknown: 'Tidak Diketahui',
} as const

export const grindLevelTranslations = {
  halus: 'Halus',
  sedang: 'Sedang',
  kasar: 'Kasar',
  unknown: 'Tidak Diketahui',
} as const

export const conditionTranslations = {
  basah: 'Basah',
  kering: 'Kering',
  unknown: 'Tidak Diketahui',
} as const

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Calculate average rating
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}