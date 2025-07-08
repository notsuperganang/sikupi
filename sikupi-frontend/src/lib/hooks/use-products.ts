"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsService, type ProductFilters, type CreateProductRequest, type UpdateProductRequest } from "@/lib/api";
import { toast } from "sonner";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, filters: Omit<ProductFilters, "search">) => 
    [...productKeys.all, "search", query, filters] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  recommended: (productId?: string) => [...productKeys.all, "recommended", productId] as const,
  categories: () => [...productKeys.all, "categories"] as const,
  seller: (sellerId: string, filters: ProductFilters) => 
    [...productKeys.all, "seller", sellerId, filters] as const,
  my: (filters: ProductFilters) => [...productKeys.all, "my", filters] as const,
  stats: (id: string) => [...productKeys.all, "stats", id] as const,
};

// Get products with filters
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsService.getProducts(filters),
    enabled: true,
  });
}

// Get product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getProduct(id),
    enabled: !!id,
  });
}

// Search products
export function useSearchProducts(query: string, filters: Omit<ProductFilters, "search"> = {}) {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: () => productsService.searchProducts(query, filters),
    enabled: !!query.trim(),
  });
}

// Get featured products
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => productsService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get recommended products
export function useRecommendedProducts(productId?: string, limit: number = 6) {
  return useQuery({
    queryKey: productKeys.recommended(productId),
    queryFn: () => productsService.getRecommendedProducts(productId, limit),
    enabled: true,
  });
}

// Get product categories
export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get seller products
export function useSellerProducts(sellerId: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.seller(sellerId, filters),
    queryFn: () => productsService.getSellerProducts(sellerId, filters),
    enabled: !!sellerId,
  });
}

// Get my products (for authenticated seller)
export function useMyProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.my(filters),
    queryFn: () => productsService.getMyProducts(filters),
  });
}

// Get product stats
export function useProductStats(id: string) {
  return useQuery({
    queryKey: productKeys.stats(id),
    queryFn: () => productsService.getProductStats(id),
    enabled: !!id,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsService.createProduct(data),
    onSuccess: (data) => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.my({}) });
      
      toast.success("Produk berhasil dibuat!", {
        description: `${data.product.title} telah ditambahkan ke katalog.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal membuat produk", {
        description: error.message || "Terjadi kesalahan saat membuat produk.",
      });
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => 
      productsService.updateProduct(id, data),
    onSuccess: (data, variables) => {
      // Update product detail cache
      queryClient.setQueryData(
        productKeys.detail(variables.id),
        { product: data.product }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.my({}) });
      
      toast.success("Produk berhasil diperbarui!", {
        description: `${data.product.title} telah diperbarui.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui produk", {
        description: error.message || "Terjadi kesalahan saat memperbarui produk.",
      });
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.my({}) });
      
      toast.success("Produk berhasil dihapus!", {
        description: "Produk telah dihapus dari katalog.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus produk", {
        description: error.message || "Terjadi kesalahan saat menghapus produk.",
      });
    },
  });
}

// Toggle product status mutation
export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.toggleProductStatus(id),
    onSuccess: (data, id) => {
      // Update product detail cache
      queryClient.setQueryData(
        productKeys.detail(id),
        { product: data.product }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.my({}) });
      
      const status = data.product.isActive ? "diaktifkan" : "dinonaktifkan";
      toast.success(`Produk berhasil ${status}!`, {
        description: `${data.product.title} telah ${status}.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal mengubah status produk", {
        description: error.message || "Terjadi kesalahan saat mengubah status produk.",
      });
    },
  });
}

// Update product images mutation
export function useUpdateProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, images }: { id: string; images: File[] }) => 
      productsService.updateProductImages(id, images),
    onSuccess: (data, variables) => {
      // Invalidate product detail to refetch with new images
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      
      toast.success("Gambar produk berhasil diperbarui!", {
        description: "Gambar produk telah diperbarui.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui gambar produk", {
        description: error.message || "Terjadi kesalahan saat memperbarui gambar.",
      });
    },
  });
}