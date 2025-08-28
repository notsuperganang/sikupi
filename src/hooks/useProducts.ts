import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { ProductFilters, ProductsResponse, Product } from '@/lib/products'
import { filtersToSearchParams, transformProduct } from '@/lib/products'

// Product API functions
async function fetchProducts(filters: ProductFilters): Promise<ProductsResponse> {
  const searchParams = filtersToSearchParams(filters)
  
  const response = await fetch(`/api/products?${searchParams.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch products')
  }
  
  // Transform the API response to match our expected format
  const transformedProducts = (data.data.products || []).map((apiProduct: any) => {
    return transformProduct(apiProduct)
  })
  
  return {
    items: transformedProducts,
    nextCursor: data.data.pagination?.has_next_page ? 
      `page_${data.data.pagination.current_page + 1}` : undefined,
    total: data.data.pagination?.total_items,
    countsByCategory: data.data.counts_by_category
  }
}

async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`/api/products/${id}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch product')
  }
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch product')
  }
  
  return transformProduct(data.data)
}

// Generate stable query key from filters
function getProductsQueryKey(filters: ProductFilters): (string | ProductFilters)[] {
  // Remove undefined/null values and create a stable key
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
  ) as ProductFilters
  
  return ['products', cleanFilters]
}

// Main products hook with pagination
export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: getProductsQueryKey(filters),
    queryFn: ({ pageParam }) => {
      const filtersWithCursor = { ...filters }
      if (pageParam) {
        filtersWithCursor.cursor = pageParam
      }
      return fetchProducts(filtersWithCursor)
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

// Hook for single product fetch
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })
}

// Hook for getting aggregated products data
export function useProductsData(filters: ProductFilters) {
  const query = useProducts(filters)
  
  // Flatten all pages into a single array
  const products = query.data?.pages.flatMap(page => page.items) || []
  
  // Get total count from first page
  const total = query.data?.pages[0]?.total
  
  // Get category counts from first page
  const countsByCategory = query.data?.pages[0]?.countsByCategory
  
  return {
    ...query,
    products,
    total,
    countsByCategory,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  }
}

// Hook for category statistics
export function useCategoryStats() {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: async () => {
      const response = await fetch('/api/products/categories/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch category stats')
      }
      
      const data = await response.json()
      return data.data || {}
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Hook for product search suggestions
export function useProductSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['productSearch', query],
    queryFn: async () => {
      if (!query.trim()) return []
      
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=5`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      return data.data?.products || []
    },
    enabled: enabled && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Custom hook for managing product filters state
export function useProductFilters(initialFilters: ProductFilters = {}) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset cursor when filters change
      cursor: undefined
    }))
  }
  
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset cursor when filters change
      cursor: undefined
    }))
  }
  
  const clearFilters = () => {
    setFilters({
      sort: filters.sort || 'newest',
      limit: filters.limit || 24
    })
  }
  
  const hasActiveFilters = !!(
    filters.q ||
    filters.kind ||
    filters.category ||
    filters.coffeeType ||
    filters.grindLevel ||
    filters.condition ||
    filters.minPrice ||
    filters.maxPrice
  )
  
  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    setFilters
  }
}

import { useState } from 'react'