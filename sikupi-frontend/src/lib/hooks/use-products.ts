// FILE PATH: /sikupi-frontend/src/lib/hooks/use-products.ts

"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { 
  productsService, 
  type ProductFilters, 
  type CreateProductRequest, 
  type UpdateProductRequest,
  type Product 
} from "@/lib/api/services/products";
import { toast } from "sonner";

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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 2,
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    initialPageParam: 1,
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
    retry: 2,
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
    staleTime: 1 * 60 * 1000, // 1 minute for search results
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

// Get featured products
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productsService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

// Get recommended products
export function useRecommendedProducts(productId?: string, limit: number = 6) {
  return useQuery({
    queryKey: productKeys.recommended(productId, limit),
    queryFn: () => productsService.getRecommendedProducts(productId, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
}

// Get product categories
export function useProductCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

// Get seller products
export function useSellerProducts(sellerId: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.seller(sellerId, filters),
    queryFn: () => productsService.getSellerProducts(sellerId, filters),
    enabled: !!sellerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Get my products (for authenticated seller)
export function useMyProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.my(filters),
    queryFn: () => productsService.getMyProducts(filters),
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for own products)
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

// Mutations for product management

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsService.createProduct(data),
    onSuccess: (response) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: productKeys.my() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
      
      toast.success('Product created successfully!', {
        description: 'Your product has been added to the marketplace.',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to create product';
      toast.error('Failed to create product', {
        description: errorMessage,
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
    onSuccess: (response, variables) => {
      // Update specific product in cache
      queryClient.setQueryData(
        productKeys.detail(variables.id),
        { product: response.product }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.my() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to update product';
      toast.error('Failed to update product', {
        description: errorMessage,
      });
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.my() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to delete product';
      toast.error('Failed to delete product', {
        description: errorMessage,
      });
    },
  });
}

// Upload product images mutation
export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, images }: { id: string; images: File[] }) => 
      productsService.uploadProductImages(id, images),
    onSuccess: (response, variables) => {
      // Update product data in cache with new images
      queryClient.setQueryData(
        productKeys.detail(variables.id),
        (oldData: any) => {
          if (oldData?.product) {
            return {
              ...oldData,
              product: {
                ...oldData.product,
                imageUrls: response.imageUrls,
              },
            };
          }
          return oldData;
        }
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.my() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success('Images uploaded successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to upload images';
      toast.error('Failed to upload images', {
        description: errorMessage,
      });
    },
  });
}

// Toggle favorite mutation
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsService.toggleFavorite(productId),
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: productKeys.detail(productId) });
      
      // Snapshot the previous value
      const previousProduct = queryClient.getQueryData(productKeys.detail(productId));
      
      // Optimistically update to the new value
      queryClient.setQueryData(
        productKeys.detail(productId),
        (old: any) => {
          if (old?.product) {
            return {
              ...old,
              product: {
                ...old.product,
                // Note: We'd need to add isFavorite to Product type
                // isFavorite: !old.product.isFavorite,
              },
            };
          }
          return old;
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousProduct };
    },
    onError: (err, productId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProduct) {
        queryClient.setQueryData(productKeys.detail(productId), context.previousProduct);
      }
      
      toast.error('Failed to update favorite status');
    },
    onSuccess: (response, productId) => {
      // Update any product lists that might contain this product
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success(response.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    },
    onSettled: (_, __, productId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

// Prefetch product details (for hover states, etc.)
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(id),
      queryFn: () => productsService.getProduct(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

// Utility hooks

// Combined hook for product listing page
export function useProductListingPage(filters: ProductFilters = {}) {
  const productsQuery = useProducts(filters);
  const categoriesQuery = useProductCategories();
  
  return {
    // Products data
    products: productsQuery.data?.products || [],
    pagination: productsQuery.data?.pagination,
    filters: productsQuery.data?.filters,
    
    // Categories for filtering
    categories: categoriesQuery.data?.wasteTypes || [],
    
    // Loading states
    isLoadingProducts: productsQuery.isLoading,
    isLoadingCategories: categoriesQuery.isLoading,
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    
    // Error states
    productsError: productsQuery.error,
    categoriesError: categoriesQuery.error,
    error: productsQuery.error || categoriesQuery.error,
    
    // Refetch functions
    refetchProducts: productsQuery.refetch,
    refetchCategories: categoriesQuery.refetch,
  };
}

// Combined hook for seller dashboard
export function useSellerDashboard(filters: ProductFilters = {}) {
  const myProductsQuery = useMyProducts(filters);
  const categoriesQuery = useProductCategories();
  
  return {
    // My products
    products: myProductsQuery.data?.products || [],
    pagination: myProductsQuery.data?.pagination,
    
    // Categories
    categories: categoriesQuery.data?.wasteTypes || [],
    
    // Loading states
    isLoading: myProductsQuery.isLoading || categoriesQuery.isLoading,
    
    // Error states
    error: myProductsQuery.error || categoriesQuery.error,
    
    // Refetch
    refetch: () => {
      myProductsQuery.refetch();
      categoriesQuery.refetch();
    },
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

// Export query keys for external use
export { productKeys };