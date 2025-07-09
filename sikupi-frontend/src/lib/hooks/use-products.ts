// FILE: src/lib/hooks/use-products.ts (Updated)
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { mockProductsService } from "@/lib/mock/complete-mock-services";
import { toast } from "sonner";
import type { Product, ProductFilters } from "@/lib/types/product";

// Query keys for React Query
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  infinite: (filters: ProductFilters) => [...productKeys.lists(), "infinite", filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, filters: Omit<ProductFilters, "search">) => 
    [...productKeys.all, "search", query, filters] as const,
  featured: (limit?: number) => [...productKeys.all, "featured", limit] as const,
  recommended: (productId?: string, limit?: number) => 
    [...productKeys.all, "recommended", productId, limit] as const,
  categories: () => [...productKeys.all, "categories"] as const,
  seller: (sellerId: string, filters?: ProductFilters) => 
    [...productKeys.all, "seller", sellerId, filters] as const,
  my: (filters?: ProductFilters) => [...productKeys.all, "my", filters] as const,
  stats: (id: string) => [...productKeys.all, "stats", id] as const,
};

// Get products with filters (basic pagination)
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => mockProductsService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Get products with infinite scroll pagination
export function useInfiniteProducts(filters: ProductFilters = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.infinite(filters),
    queryFn: ({ pageParam = 1 }) => 
      mockProductsService.getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    initialPageParam: 1,
  });
}

// Get product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => mockProductsService.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Search products
export function useSearchProducts(
  query: string, 
  filters: Omit<ProductFilters, "search"> = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: () => mockProductsService.searchProducts(query, filters),
    enabled: enabled && !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Get featured products
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => mockProductsService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

// Get recommended products
export function useRecommendedProducts(productId?: string, limit: number = 6) {
  return useQuery({
    queryKey: productKeys.recommended(productId, limit),
    queryFn: () => mockProductsService.getRecommendedProducts(productId, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
}

// Get product categories
export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => mockProductsService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}

// Get seller products
export function useSellerProducts(sellerId: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.seller(sellerId, filters),
    queryFn: () => {
      // Filter products by sellerId in mock service
      return mockProductsService.getProducts(filters).then(result => ({
        ...result,
        products: result.products.filter(p => p.sellerId === sellerId)
      }));
    },
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Get my products (for sellers)
export function useMyProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.my(filters),
    queryFn: () => mockProductsService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, product: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produk berhasil dibuat!");
    },
    onError: (error: any) => {
      toast.error("Gagal membuat produk", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, product: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produk berhasil diperbarui!");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui produk", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produk berhasil dihapus!");
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus produk", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Toggle favorite product mutation
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, isFavorite: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produk ditambahkan ke favorit!");
    },
    onError: (error: any) => {
      toast.error("Gagal menambahkan ke favorit", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Prefetch product details (for hover states, etc.)
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => mockProductsService.getProduct(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// Combined hook for product listing page
export function useProductListingPage(filters: ProductFilters = {}) {
  const productsQuery = useProducts(filters);
  const categoriesQuery = useProductCategories();
  
  return {
    products: productsQuery.data?.products || [],
    pagination: productsQuery.data?.pagination,
    filters: productsQuery.data?.filters,
    categories: categoriesQuery.data?.wasteTypes || [],
    isLoadingProducts: productsQuery.isLoading,
    isLoadingCategories: categoriesQuery.isLoading,
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    productsError: productsQuery.error,
    categoriesError: categoriesQuery.error,
    error: productsQuery.error || categoriesQuery.error,
    refetchProducts: productsQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
  };
}

// Hook for product search with debouncing
export function useDebouncedSearch(
  query: string,
  filters: Omit<ProductFilters, "search"> = {},
  debounceMs: number = 300
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useSearchProducts(debouncedQuery, filters, debouncedQuery.length > 2);
}