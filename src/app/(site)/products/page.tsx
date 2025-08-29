import { Metadata } from 'next'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductListingClient } from './components/ProductListingClient'
import { ProductGridSkeleton } from './components/ProductSkeleton'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { Highlight } from '@/components/ui/hero-highlight'
import { searchParamsToFilters, transformProduct, validateProductFilters } from '@/lib/products'
import type { Product } from '@/lib/products'

// Force dynamic rendering for this page since we use searchParams
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Belanja Produk - Sikupi',
  description: 'Jelajahi berbagai produk ampas kopi dan turunannya. Dari ampas kopi organik hingga briket, pupuk, dan produk inovatif lainnya.',
  keywords: ['ampas kopi', 'coffee grounds', 'briket', 'pupuk organik', 'scrub kopi', 'produk ramah lingkungan', 'Banda Aceh'],
  openGraph: {
    title: 'Belanja Produk - Sikupi',
    description: 'Temukan produk ampas kopi berkualitas dan produk turunannya di Sikupi.',
    type: 'website',
  }
}

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Server-side data fetching
async function getInitialProducts(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
  try {
    // Await searchParams as required in Next.js 15
    const params = await searchParams
    
    // Convert search params to filters and validate
    const urlSearchParams = new URLSearchParams()
    
    // Handle search params more carefully for static generation
    const allowedParams = ['q', 'kind', 'category', 'coffeeType', 'grindLevel', 'condition', 'minPrice', 'maxPrice', 'sort', 'limit']
    
    allowedParams.forEach(key => {
      const value = params[key]
      if (value && typeof value === 'string') {
        urlSearchParams.set(key, value)
      }
    })
    
    const filters = searchParamsToFilters(urlSearchParams)
    const validatedFilters = validateProductFilters(filters)

    // Build Supabase query
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('published', true)

    // Apply filters
    if (validatedFilters.q) {
      query = query.or(
        `title.ilike.%${validatedFilters.q}%,description.ilike.%${validatedFilters.q}%,sku.ilike.%${validatedFilters.q}%`
      )
    }

    if (validatedFilters.category) {
      query = query.eq('category', validatedFilters.category)
    }

    if (validatedFilters.kind) {
      query = query.eq('kind', validatedFilters.kind)
    }

    if (validatedFilters.coffeeType) {
      query = query.eq('coffee_type', validatedFilters.coffeeType)
    }

    if (validatedFilters.grindLevel) {
      query = query.eq('grind_level', validatedFilters.grindLevel)
    }

    if (validatedFilters.condition) {
      query = query.eq('condition', validatedFilters.condition)
    }

    if (validatedFilters.minPrice !== undefined) {
      query = query.gte('price_idr', validatedFilters.minPrice)
    }

    if (validatedFilters.maxPrice !== undefined && validatedFilters.maxPrice !== Number.MAX_SAFE_INTEGER) {
      query = query.lte('price_idr', validatedFilters.maxPrice)
    }

    // Apply sorting
    const sortConfig = {
      newest: { column: 'created_at', dir: 'desc' as const },
      oldest: { column: 'created_at', dir: 'asc' as const },
      price_asc: { column: 'price_idr', dir: 'asc' as const },
      price_desc: { column: 'price_idr', dir: 'desc' as const },
      title: { column: 'title', dir: 'asc' as const },
      rating: { column: 'created_at', dir: 'desc' as const }, // Will be sorted client-side
    }

    const sort = sortConfig[validatedFilters.sort || 'newest']
    if (validatedFilters.sort !== 'rating') {
      query = query.order(sort.column, { ascending: sort.dir === 'asc' })
      query = query.order('id', { ascending: true }) // Tiebreaker
    }

    // Limit initial results
    query = query.limit(validatedFilters.limit || 24)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Failed to fetch products:', error)
      return { products: [], filters: validatedFilters, total: 0 }
    }

    // Fetch rating data for these products
    let ratingsMap = new Map()
    if (products && products.length > 0) {
      const productIds = products.map((p: any) => p.id)
      const { data: ratingsData, error: ratingsError } = await supabaseAdmin
        .from('product_rating_summary')
        .select('*')
        .in('product_id', productIds)
      
      if (!ratingsError && ratingsData) {
        ratingsData.forEach((rating: any) => {
          ratingsMap.set(rating.product_id, rating)
        })
      }
    }

    // Transform products with rating data
    const transformedProducts: Product[] = (products || []).map((product: any) => {
      const ratingData = ratingsMap.get(product.id) || null
      
      return transformProduct({
        ...product,
        rating_stats: ratingData ? {
          total_reviews: ratingData.total_reviews || 0,
          avg_rating: ratingData.avg_rating || 0,
          rating_breakdown: {
            5: ratingData.five_stars || 0,
            4: ratingData.four_stars || 0,
            3: ratingData.three_stars || 0,
            2: ratingData.two_stars || 0,
            1: ratingData.one_star || 0
          }
        } : {
          total_reviews: 0,
          avg_rating: 0,
          rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      })
    })

    // Apply rating-based sorting if needed
    if (validatedFilters.sort === 'rating') {
      transformedProducts.sort((a, b) => {
        const aRating = a.ratingAvg || 0
        const bRating = b.ratingAvg || 0
        return bRating - aRating // Descending order
      })
    }

    return {
      products: transformedProducts,
      filters: validatedFilters,
      total: count || 0
    }

  } catch (error) {
    console.error('Error in getInitialProducts:', error)
    return { products: [], filters: validateProductFilters({}), total: 0 }
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Server-side data fetching
  const { filters: initialFilters } = await getInitialProducts(searchParams)

  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <div className="bg-stone-50 border-b border-stone-200" style={{ backgroundColor: '#fafaf9' }}>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Title with SparklesText */}
            <div className="mb-8">
              <SparklesText
                colors={{
                  first: "#8B4513", // Coffee brown
                  second: "#A0522D"  // Sienna brown
                }}
                sparklesCount={15}
                className="text-4xl md:text-6xl font-bold font-serif text-amber-900 leading-tight"
              >
                Katalog{" "}
                <span className="bg-gradient-to-r from-amber-800 via-yellow-800 to-amber-900 bg-clip-text text-transparent">
                  Produk
                </span>
              </SparklesText>
            </div>
            
            {/* Divider Line */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-amber-700 to-yellow-800 mx-auto mb-8"></div>
            
            {/* Subtitle */}
            <p className="text-xl font-medium text-stone-700 max-w-3xl mx-auto mb-2 leading-relaxed">
              Temukan koleksi lengkap produk ampas kopi dan turunannya dari{" "}
              <Highlight className="bg-gradient-to-r from-amber-800/30 to-yellow-800/30 dark:from-amber-800/50 dark:to-yellow-800/50 px-2 py-1 rounded-md">
                Aceh
              </Highlight>
              . Filter berdasarkan kategori, harga, dan kebutuhan Anda.
            </p>
            
            {/* Trust Chips */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-stone-700 font-medium">100% Upcycle</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-stone-700 font-medium">Mitra Lokal</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-stone-700 font-medium">Kualitas Terseleksi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Suspense fallback={<ProductGridSkeleton count={12} className="container mx-auto px-4 py-6" />}>
        <ProductListingClient 
          initialFilters={initialFilters}
        />
      </Suspense>
    </main>
  )
}

// Generate static params for common filter combinations (optional optimization)
export async function generateStaticParams() {
  return [
    {}, // Default page
    { category: 'ampas_kopi' },
    { category: 'briket' },
    { kind: 'ampas' },
    { kind: 'turunan' },
  ]
}