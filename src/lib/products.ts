import { Coffee, Package2, Zap, Sparkles, Leaf, Cat, MoreHorizontal } from 'lucide-react'
import type { ProductCategory, CoffeeType, GrindLevel, Condition, ProductKind } from '@/types/database'
import { z } from 'zod'

export type Product = {
  id: string;
  slug: string | null;
  title: string;
  kind: ProductKind;
  category: ProductCategory;
  price: number;
  stockQty: number;
  imageUrl?: string | null;
  ratingAvg?: number;
  ratingCount?: number;
  soldCount?: number;
  coffeeType?: CoffeeType;
  grindLevel?: GrindLevel;
  condition?: Condition;
  createdAt: string;
  shortDescription?: string | null;
  published?: boolean;
}

export type ProductFilters = {
  q?: string;
  kind?: ProductKind;
  category?: ProductCategory;
  coffeeType?: CoffeeType;
  grindLevel?: GrindLevel;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title' | 'rating';
  cursor?: string;
  limit?: number;
}

export type ProductsResponse = {
  items: Product[];
  nextCursor?: string;
  total?: number;
  countsByCategory?: Record<string, number>;
}

// Format Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Get category icon
export function getCategoryIcon(category: ProductCategory) {
  const iconMap = {
    ampas_kopi: Coffee,
    briket: Package2,
    pulp: Package2,
    scrub: Sparkles,
    pupuk: Leaf,
    pakan_ternak: Cat,
    lainnya: MoreHorizontal,
  }
  
  return iconMap[category] || MoreHorizontal
}

// Check if product is new (created within 7 days)
export function isNew(createdAt: string): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
  
  return created >= sevenDaysAgo
}

// Get stock status
export function getStockStatus(stockQty: number): {
  status: 'out_of_stock' | 'low_stock' | 'in_stock';
  label: string;
  colorClass: string;
} {
  if (stockQty === 0) {
    return {
      status: 'out_of_stock',
      label: 'Stok habis',
      colorClass: 'text-red-600 bg-red-50 border-red-200'
    }
  }
  
  if (stockQty <= 5) {
    return {
      status: 'low_stock',
      label: 'Stok menipis',
      colorClass: 'text-orange-600 bg-orange-50 border-orange-200'
    }
  }
  
  return {
    status: 'in_stock',
    label: 'Stok tersedia',
    colorClass: 'text-green-600 bg-green-50 border-green-200'
  }
}

// Validate product filters
const ProductFiltersSchema = z.object({
  q: z.string().optional(),
  kind: z.enum(['ampas', 'turunan']).optional(),
  category: z.enum(['ampas_kopi', 'briket', 'pulp', 'scrub', 'pupuk', 'pakan_ternak', 'lainnya']).optional(),
  coffeeType: z.enum(['arabika', 'robusta', 'mix', 'unknown']).optional(),
  grindLevel: z.enum(['halus', 'sedang', 'kasar', 'unknown']).optional(),
  condition: z.enum(['basah', 'kering', 'unknown']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'title', 'rating']).default('newest'),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(48).default(24),
})

export function validateProductFilters(params: Record<string, any>): ProductFilters {
  // Convert string numbers to actual numbers
  const processedParams = { ...params }
  if (processedParams.minPrice) {
    processedParams.minPrice = Number(processedParams.minPrice)
  }
  if (processedParams.maxPrice) {
    processedParams.maxPrice = Number(processedParams.maxPrice)
  }
  if (processedParams.limit) {
    processedParams.limit = Math.min(Number(processedParams.limit) || 24, 48)
  }
  
  const validated = ProductFiltersSchema.parse(processedParams)
  
  // Ensure price range is valid
  if (validated.minPrice && validated.maxPrice && validated.minPrice > validated.maxPrice) {
    [validated.minPrice, validated.maxPrice] = [validated.maxPrice, validated.minPrice]
  }
  
  return validated
}

// Map sort options to database columns
export function mapSort(sort: string): { column: string; dir: "asc" | "desc" } {
  const sortMap = {
    newest: { column: 'created_at', dir: 'desc' as const },
    oldest: { column: 'created_at', dir: 'asc' as const },
    price_asc: { column: 'price_idr', dir: 'asc' as const },
    price_desc: { column: 'price_idr', dir: 'desc' as const },
    title: { column: 'title', dir: 'asc' as const },
    rating: { column: 'created_at', dir: 'desc' as const }, // Will be handled separately
  }
  
  return sortMap[sort as keyof typeof sortMap] || sortMap.newest
}

// Generate cursor for pagination
export function generateCursor(product: any, sortColumn: string): string {
  const value = product[sortColumn]
  const id = product.id
  return Buffer.from(`${value}|${id}`).toString('base64')
}

// Parse cursor for pagination
export function parseCursor(cursor: string): { value: string; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString()
    const [value, id] = decoded.split('|')
    return { value, id }
  } catch {
    return null
  }
}

// Transform database product to frontend format
export function transformProduct(dbProduct: any): Product {
  // Get first image URL from array or null
  const imageUrl = dbProduct.image_urls && Array.isArray(dbProduct.image_urls) && dbProduct.image_urls.length > 0
    ? dbProduct.image_urls[0]
    : null

  return {
    id: dbProduct.id.toString(),
    slug: dbProduct.slug,
    title: dbProduct.title || 'Untitled Product',
    kind: dbProduct.kind,
    category: dbProduct.category,
    price: Number(dbProduct.price_idr) || 0,
    stockQty: parseFloat(dbProduct.stock_qty?.toString() || '0'),
    imageUrl,
    ratingAvg: dbProduct.rating_stats?.avg_rating || 0,
    ratingCount: dbProduct.rating_stats?.total_reviews || 0,
    soldCount: dbProduct.sold_count || 0,
    coffeeType: dbProduct.coffee_type,
    grindLevel: dbProduct.grind_level,
    condition: dbProduct.condition,
    createdAt: dbProduct.created_at,
    shortDescription: dbProduct.description,
    published: dbProduct.published,
  }
}

// Category translations
export const categoryTranslations = {
  ampas_kopi: 'Ampas Kopi',
  briket: 'Briket',
  pulp: 'Pulp',
  scrub: 'Scrub',
  pupuk: 'Pupuk',
  pakan_ternak: 'Pakan Ternak',
  lainnya: 'Lainnya',
} as const

// Coffee type translations
export const coffeeTypeTranslations = {
  arabika: 'Arabika',
  robusta: 'Robusta',
  mix: 'Campuran',
  unknown: 'Tidak Diketahui',
} as const

// Grind level translations
export const grindLevelTranslations = {
  halus: 'Halus',
  sedang: 'Sedang',
  kasar: 'Kasar',
  unknown: 'Tidak Diketahui',
} as const

// Condition translations
export const conditionTranslations = {
  basah: 'Basah',
  kering: 'Kering',
  unknown: 'Tidak Diketahui',
} as const

// Sort option translations
export const sortTranslations = {
  newest: 'Terbaru',
  oldest: 'Terlama',
  price_asc: 'Harga Terendah',
  price_desc: 'Harga Tertinggi',
  title: 'Nama A-Z',
  rating: 'Rating Tertinggi',
} as const

// Check if filters are active
export function hasActiveFilters(filters: ProductFilters): boolean {
  return !!(
    filters.q ||
    filters.kind ||
    filters.category ||
    filters.coffeeType ||
    filters.grindLevel ||
    filters.condition ||
    filters.minPrice ||
    filters.maxPrice
  )
}

// Build URL search params from filters
export function filtersToSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value.toString())
    }
  })
  
  return params
}

// Parse search params to filters
export function searchParamsToFilters(searchParams: URLSearchParams): ProductFilters {
  const filters: Record<string, any> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (value) {
      filters[key] = value
    }
  }
  
  return validateProductFilters(filters)
}