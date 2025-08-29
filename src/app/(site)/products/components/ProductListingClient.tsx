'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, LayoutGrid, LayoutList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProductsData } from '@/hooks/useProducts'
import { useLocalStorage, useLocalStorageSSR } from '@/hooks/useLocalStorage'
import { ProductCardGrid } from './ProductCard'
import { FilterSidebar } from './FilterSidebar'
import { ProductQuickViewModal } from './ProductQuickViewModal'
import { ProductGridSkeleton, ProductStatsSkeleton } from './ProductSkeleton'
import { 
  ProductErrorBoundary, 
  QueryErrorFallback, 
  EmptyState, 
  LoadMoreError 
} from './ProductErrorBoundary'
import { 
  searchParamsToFilters, 
  filtersToSearchParams,
  hasActiveFilters 
} from '@/lib/products'
import type { Product, ProductFilters } from '@/lib/products'

interface ProductListingClientProps {
  initialFilters?: ProductFilters
  className?: string
}

export function ProductListingClient({ 
  initialFilters = {},
  className 
}: ProductListingClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [filters, setFilters] = useState<ProductFilters>(() => {
    // Try to get filters from URL params first, then fall back to initial filters
    const urlFilters = searchParamsToFilters(searchParams)
    return { ...initialFilters, ...urlFilters }
  })
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode, isViewModeLoaded] = useLocalStorageSSR<'grid' | 'list'>('product-view-mode', 'grid')

  // Persistent user preferences
  const [, setUserPreferences] = useLocalStorage('product-filters-preferences', {
    lastSort: 'newest' as ProductFilters['sort'],
    lastFilters: {} as Partial<ProductFilters>
  })

  // Products query
  const {
    products = [],
    total,
    isLoading,
    isFetching,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useProductsData(filters)

  // Update URL when filters change
  useEffect(() => {
    const urlSearchParams = filtersToSearchParams(filters)
    const newUrl = `${window.location.pathname}?${urlSearchParams.toString()}`
    
    // Only update if URL would actually change
    if (newUrl !== window.location.href) {
      router.replace(newUrl, { scroll: false })
    }
  }, [filters, router])

  // Save user preferences
  useEffect(() => {
    setUserPreferences({
      lastSort: (filters.sort || 'newest') as ProductFilters['sort'],
      lastFilters: {
        kind: filters.kind,
        category: filters.category,
        coffeeType: filters.coffeeType,
        grindLevel: filters.grindLevel,
        condition: filters.condition
      }
    })
  }, [filters, setUserPreferences])

  const handleFiltersChange = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      cursor: undefined // Reset cursor when filters change
    }))
  }, [])

  const handleClearFilters = () => {
    setFilters({
      sort: filters.sort || 'newest',
      limit: filters.limit || 24
    })
  }

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product)
    setIsQuickViewOpen(true)
  }

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', productId, quantity)
    // Here you would typically call an API or update cart state
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const activeFiltersCount = hasActiveFilters(filters)

  return (
    <ProductErrorBoundary>
      <div className={`min-h-screen bg-stone-50 ${className || ''}`} style={{ backgroundColor: '#fafaf9' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                className="bg-white rounded-xl p-6 shadow-lg border border-stone-200"
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="bg-white rounded-xl p-6 shadow-lg mb-6 border border-stone-200">
                <div className="flex items-center justify-between">
                  {/* Mobile filter button */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="lg:hidden flex items-center gap-2"
                      style={{ borderColor: '#6b4e3c', color: '#6b4e3c', backgroundColor: 'transparent' }}
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                      {activeFiltersCount && (
                        <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {[filters.q, filters.kind, filters.category, filters.coffeeType, filters.grindLevel, filters.condition, filters.minPrice, filters.maxPrice].filter(Boolean).length}
                        </span>
                      )}
                    </Button>

                    {/* Results count */}
                    {isLoading ? (
                      <ProductStatsSkeleton />
                    ) : (
                      <div className="text-sm text-stone-600" style={{ color: '#57534e' }}>
                        {total !== undefined && (
                          <>
                            {products.length > 0 
                              ? `Menampilkan ${products.length} dari ${total} produk`
                              : `Tidak ada produk ditemukan dari ${total} total produk`
                            }
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View mode toggle */}
                  {isViewModeLoaded && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        aria-label="Tampilan grid"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        aria-label="Tampilan list"
                      >
                        <LayoutList className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Content */}
              <div className="space-y-6">
                {isLoading && products.length === 0 ? (
                  // Initial loading
                  <ProductGridSkeleton count={12} />
                ) : isError ? (
                  // Error state
                  <QueryErrorFallback 
                    error={new Error('Failed to load products')} 
                    retry={refetch}
                    isLoading={isFetching}
                  />
                ) : products.length === 0 ? (
                  // Empty state
                  <EmptyState
                    title={activeFiltersCount ? "Tidak ada produk yang cocok" : "Belum ada produk"}
                    description={
                      activeFiltersCount 
                        ? "Coba ubah atau hapus beberapa filter untuk melihat lebih banyak hasil."
                        : "Produk akan muncul di sini setelah ditambahkan."
                    }
                    showClearFilters={activeFiltersCount}
                    onClearFilters={handleClearFilters}
                  />
                ) : (
                  // Products grid/list
                  <>
                    <ProductCardGrid
                      products={products}
                      onQuickView={handleQuickView}
                      onAddToCart={(id) => handleAddToCart(id, 1)}
                    />

                    {/* Load more */}
                    {hasNextPage && (
                      <div className="text-center py-6">
                        {isFetchingNextPage ? (
                          <ProductGridSkeleton count={4} />
                        ) : (
                          <Button
                            onClick={handleLoadMore}
                            variant="outline"
                            size="lg"
                            disabled={!hasNextPage}
                          >
                            Muat Lebih Banyak
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Load more error */}
                    {error && products.length > 0 && (
                      <LoadMoreError
                        error={new Error('Failed to load more products')}
                        retry={fetchNextPage}
                        isLoading={isFetchingNextPage}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isMobile={true}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Quick View Modal */}
        {(isQuickViewOpen || selectedProduct) && (
          <ProductQuickViewModal
            product={selectedProduct}
            isOpen={isQuickViewOpen}
            onClose={() => {
              setIsQuickViewOpen(false)
              setSelectedProduct(null)
            }}
            onAddToCart={(id, quantity) => {
              handleAddToCart(id, quantity)
              setIsQuickViewOpen(false)
              setSelectedProduct(null)
            }}
          />
        )}
      </div>
    </ProductErrorBoundary>
  )
}