// FILE: sikupi-frontend/src/lib/hooks/use-products.ts
// GANTI seluruh file dengan kode berikut untuk fix TypeScript errors:

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { productsService } from "@/lib/services/api";
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
    queryFn: () => productsService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Get products with infinite scroll pagination
export function useInfiniteProducts(filters: ProductFilters = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.infinite(filters),
    queryFn: ({ pageParam = 1 }) => 
      productsService.getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
  });
}

// Get product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
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
    queryFn: () => productsService.searchProducts(query, filters),
    enabled: enabled && !!query.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Get featured products - FIXED VERSION
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productsService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    // TAMBAHAN: Debug transform untuk melihat data
    select: (data) => {
      console.log('useFeaturedProducts - Raw data:', data);
      return data;
    }
  });
}

// Get recommended products
export function useRecommendedProducts(productId?: string, limit: number = 6) {
  return useQuery({
    queryKey: productKeys.recommended(productId, limit),
    queryFn: () => productsService.getRecommendedProducts(productId, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Get product categories
export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Get seller products
export function useSellerProducts(sellerId: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.seller(sellerId, filters),
    queryFn: () => {
      // Add sellerId to filters when we implement seller filtering on backend
      // For now, we'll filter on frontend (not optimal but works)
      return productsService.getProducts(filters).then(result => ({
        ...result,
        products: result.products.filter(p => p.sellerId === sellerId)
      }));
    },
    enabled: !!sellerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Get user's own products (for seller dashboard)
export function useMyProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.my(filters),
    queryFn: () => {
      // This would need seller authentication and specific endpoint
      // For now, placeholder that returns empty
      return Promise.resolve({
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false
        },
        filters: {
          wasteTypes: [],
          qualityGrades: [],
          categories: [],
          priceRange: { min: 0, max: 0 },
          locations: []
        }
      });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// Product creation mutation (for sellers)
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => {
      // This would need backend endpoint for creating products
      // For now, placeholder
      return Promise.resolve({ success: true, product: productData });
    },
    onSuccess: () => {
      // Invalidate products queries to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produk berhasil ditambahkan");
    },
    onError: (error: any) => {
      toast.error("Gagal menambahkan produk", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Product update mutation (for sellers)
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      // This would need backend endpoint for updating products
      // For now, placeholder
      return Promise.resolve({ success: true, product: { id, ...data } });
    },
    onSuccess: (result, variables) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Produk berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui produk", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Product delete mutation (for sellers)
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      // This would need backend endpoint for deleting products
      // For now, placeholder
      return Promise.resolve({ success: true });
    },
    onSuccess: (result, productId) => {
      // Remove product from cache and invalidate lists
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Produk berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus produk", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Toggle favorite product - FIXED SIGNATURE
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, isFavorited }: { productId: string; isFavorited: boolean }) => {
      // This would need backend endpoint for favoriting
      // For now, placeholder
      console.log(`Toggling favorite for product ${productId} to ${isFavorited}`);
      return Promise.resolve({ success: true, isFavorited: !isFavorited });
    },
    onSuccess: (result, variables) => {
      // Update product cache
      queryClient.setQueryData(
        productKeys.detail(variables.productId),
        (old: any) => old ? {
          ...old,
          product: {
            ...old.product,
            isFavorited: result.isFavorited
          }
        } : old
      );
      
      toast.success(result.isFavorited ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
    },
    onError: (error: any) => {
      toast.error("Gagal mengubah favorit", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Custom hook for product filtering with debounced search
export function useProductFilters(initialFilters: ProductFilters = {}) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<ProductFilters>(filters);

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    const reset = { page: 1, limit: initialFilters.limit || 10 };
    setFilters(reset);
    setDebouncedFilters(reset);
  };

  return {
    filters,
    debouncedFilters,
    updateFilters,
    resetFilters,
    setFilters
  };
}

// FIXED: Helper hook to check if backend is available - NO AWAIT in non-async function
export function useBackendHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      // Import inside async function to avoid top-level await
      const { healthService } = await import("@/lib/services/api");
      return healthService.checkHealth();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}