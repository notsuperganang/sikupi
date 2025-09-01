import { Metadata } from 'next'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductListingClient } from './components/ProductListingClient'
import { ProductGridSkeleton } from './components/ProductSkeleton'
import { AnimatedProductHeroSection } from './components/AnimatedProductHeroSection'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
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
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-yellow-50/40">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Animated Background Ripple Effect */}
        <div className="absolute inset-0 z-0">
          <BackgroundRippleEffect 
            rows={8}
            cols={27}
            cellSize={56}
            borderColor="rgba(217, 119, 6, 0.4)"
            fillColor="rgba(245, 158, 11, 0.25)"
            shadowColor="rgba(154, 52, 18, 0.5)"
            activeColor="rgba(217, 119, 6, 0.6)"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-stone-50/30 to-stone-50/60 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <AnimatedProductHeroSection />
          </div>
        </div>
      </section>

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