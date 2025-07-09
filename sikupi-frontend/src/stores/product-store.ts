// FILE PATH: /sikupi-frontend/src/stores/product-store.ts

import { create } from "zustand";
import { 
  productsService, 
  type Product, 
  type ProductFilters, 
  type CreateProductRequest,
  type UpdateProductRequest 
} from "@/lib/api/services/products";
import { toast } from "sonner";

export type { Product, ProductFilters } from "@/lib/api/services/products";

export interface ProductSort {
  field: "newest" | "oldest" | "price_low" | "price_high" | "rating" | "popular";
  direction: "asc" | "desc";
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface ProductState {
  // State
  products: Product[];
  featured: Product[];
  categories: Array<{ type: string; label: string; count: number }>;
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination & Filters
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  filters: ProductFilters;
  sort: ProductSort;
  
  // Search
  searchQuery: string;
  searchHistory: string[];
  suggestions: string[];
  
  // Favorites
  favorites: string[];
  
  // Cache management
  lastFetch: number;
  cacheTimeout: number; // 5 minutes

  // Actions
  setProducts: (products: Product[]) => void;
  addProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  
  // Fetching functions
  fetchProducts: (page?: number, filters?: ProductFilters, sort?: ProductSort) => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchMyProducts: (filters?: ProductFilters) => Promise<void>;
  fetchSellerProducts: (sellerId: string, filters?: ProductFilters) => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchProducts: (query: string, filters?: Omit<ProductFilters, 'search'>) => Promise<void>;
  
  // Product management (for sellers)
  createProduct: (data: CreateProductRequest) => Promise<Product>;
  updateProductById: (id: string, data: UpdateProductRequest) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  uploadProductImages: (id: string, images: File[]) => Promise<string[]>;
  
  // Filters & Search
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: ProductSort) => void;
  setSearchQuery: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // Favorites
  toggleFavorite: (productId: string) => Promise<void>;
  setFavorites: (favorites: string[]) => void;
  loadFavorites: () => void;
  
  // Cache management
  shouldRefetch: () => boolean;
  clearCache: () => void;
  
  // Utilities
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  loadMore: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  featured: [],
  categories: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  hasMore: false,
  filters: {},
  sort: { field: "newest", direction: "desc" },
  
  searchQuery: "",
  searchHistory: [],
  suggestions: [],
  
  favorites: [],
  
  lastFetch: 0,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  // Basic setters
  setProducts: (products) => set({ products }),
  addProducts: (newProducts) => 
    set((state) => ({ 
      products: [...state.products, ...newProducts] 
    })),
  setCurrentProduct: (currentProduct) => set({ currentProduct }),
  
  addProduct: (product) => 
    set((state) => ({ products: [product, ...state.products] })),
  
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
      currentProduct: state.currentProduct?.id === id 
        ? { ...state.currentProduct, ...updates } 
        : state.currentProduct
    })),
  
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter(p => p.id !== id),
      currentProduct: state.currentProduct?.id === id ? null : state.currentProduct
    })),

  // Cache management
  shouldRefetch: () => {
    const { lastFetch, cacheTimeout } = get();
    return Date.now() - lastFetch > cacheTimeout;
  },

  clearCache: () => {
    set({ lastFetch: 0 });
  },

  // Fetching functions
  fetchProducts: async (page = 1, filters = {}, sort = { field: "newest", direction: "desc" }) => {
    const state = get();
    
    // Don't refetch if cache is still valid and same params
    if (page === 1 && !state.shouldRefetch() && 
        JSON.stringify(filters) === JSON.stringify(state.filters) &&
        JSON.stringify(sort) === JSON.stringify(state.sort)) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const response = await productsService.getProducts({
        ...filters,
        page,
        limit: filters.limit || 12,
        sortBy: sort.field,
      });
      
      const { products, pagination } = response;
      
      set({
        products: page === 1 ? products : [...state.products, ...products],
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        hasMore: pagination.hasNextPage,
        filters,
        sort,
        isLoading: false,
        lastFetch: Date.now(),
      });
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      set({
        error: error.message || 'Failed to load products',
        isLoading: false,
      });
    }
  },

  fetchFeaturedProducts: async (limit = 8) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await productsService.getFeaturedProducts(limit);
      
      set({
        featured: response.products,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch featured products:', error);
      set({
        error: error.message || 'Failed to load featured products',
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await productsService.getProduct(id);
      
      set({
        currentProduct: response.product,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      set({
        error: error.message || 'Failed to load product',
        isLoading: false,
      });
    }
  },

  fetchMyProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await productsService.getMyProducts(filters);
      
      set({
        products: response.products,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        hasMore: response.pagination.hasNextPage,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch my products:', error);
      set({
        error: error.message || 'Failed to load your products',
        isLoading: false,
      });
    }
  },

  fetchSellerProducts: async (sellerId: string, filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await productsService.getSellerProducts(sellerId, filters);
      
      set({
        products: response.products,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        hasMore: response.pagination.hasNextPage,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch seller products:', error);
      set({
        error: error.message || 'Failed to load seller products',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await productsService.getCategories();
      
      set({
        categories: response.wasteTypes,
      });
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      // Use default categories if API fails
      set({
        categories: [
          { type: 'coffee_grounds', label: 'Ampas Kopi', count: 0 },
          { type: 'coffee_pulp', label: 'Pulp Kopi', count: 0 },
          { type: 'coffee_husks', label: 'Kulit Kopi', count: 0 },
          { type: 'coffee_chaff', label: 'Sekam Kopi', count: 0 },
        ],
      });
    }
  },

  searchProducts: async (query: string, filters = {}) => {
    set({ isLoading: true, error: null, searchQuery: query });
    
    try {
      const response = await productsService.searchProducts(query, filters);
      
      set({
        products: response.products,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        hasMore: response.pagination.hasNextPage,
        isLoading: false,
      });
      
      // Add to search history
      get().addToSearchHistory(query);
    } catch (error: any) {
      console.error('Failed to search products:', error);
      set({
        error: error.message || 'Failed to search products',
        isLoading: false,
      });
    }
  },

  // Product management (for sellers)
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await productsService.createProduct(data);
      
      // Add to products list
      get().addProduct(response.product);
      
      set({ isLoading: false });
      
      toast.success('Product created successfully!', {
        description: 'Your product has been added to the marketplace.',
      });
      
      return response.product;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      const errorMessage = error.message || 'Failed to create product';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      
      toast.error('Failed to create product', {
        description: errorMessage,
      });
      
      throw error;
    }
  },

  updateProductById: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await productsService.updateProduct(id, data);
      
      // Update in products list
      get().updateProduct(id, response.product);
      
      set({ isLoading: false });
      
      toast.success('Product updated successfully!');
      
      return response.product;
    } catch (error: any) {
      console.error('Failed to update product:', error);
      const errorMessage = error.message || 'Failed to update product';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      
      toast.error('Failed to update product', {
        description: errorMessage,
      });
      
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      await productsService.deleteProduct(id);
      
      // Remove from products list
      get().removeProduct(id);
      
      set({ isLoading: false });
      
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      const errorMessage = error.message || 'Failed to delete product';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      
      toast.error('Failed to delete product', {
        description: errorMessage,
      });
      
      throw error;
    }
  },

  uploadProductImages: async (id: string, images: File[]): Promise<string[]> => {
    try {
      const response = await productsService.uploadProductImages(id, images);
      
      // Update product with new images
      get().updateProduct(id, { imageUrls: response.imageUrls });
      
      toast.success('Images uploaded successfully!');
      
      return response.imageUrls;
    } catch (error: any) {
      console.error('Failed to upload images:', error);
      const errorMessage = error.message || 'Failed to upload images';
      
      toast.error('Failed to upload images', {
        description: errorMessage,
      });
      
      throw error;
    }
  },

  // Filters & Search
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),
  
  clearFilters: () => 
    set({ 
      filters: {},
      currentPage: 1,
    }),
  
  setSort: (sort) => 
    set({ 
      sort,
      currentPage: 1, // Reset to first page when sort changes
    }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  addToSearchHistory: (query) => 
    set((state) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery || state.searchHistory.includes(trimmedQuery)) {
        return state;
      }
      
      const newHistory = [trimmedQuery, ...state.searchHistory.slice(0, 9)]; // Keep last 10
      
      // Save to localStorage
      try {
        localStorage.setItem('sikupi-search-history', JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Failed to save search history:', error);
      }
      
      return { searchHistory: newHistory };
    }),
  
  clearSearchHistory: () => {
    set({ searchHistory: [] });
    try {
      localStorage.removeItem('sikupi-search-history');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  },

  // Favorites
  toggleFavorite: async (productId: string) => {
    try {
      const response = await productsService.toggleFavorite(productId);
      const { favorites } = get();
      
      const newFavorites = response.isFavorite
        ? [...favorites, productId]
        : favorites.filter(id => id !== productId);
      
      set({ favorites: newFavorites });
      
      // Update product in list if it exists
      get().updateProduct(productId, { 
        // Note: We'd need to add isFavorite to Product type
      });
      
      // Save to localStorage
      try {
        localStorage.setItem('sikupi-favorites', JSON.stringify(newFavorites));
      } catch (error) {
        console.warn('Failed to save favorites:', error);
      }
      
      toast.success(response.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite status');
    }
  },
  
  setFavorites: (favorites) => set({ favorites }),
  
  loadFavorites: () => {
    try {
      const stored = localStorage.getItem('sikupi-favorites');
      if (stored) {
        const favorites = JSON.parse(stored);
        set({ favorites });
      }
    } catch (error) {
      console.warn('Failed to load favorites:', error);
    }
  },

  // Load more products (pagination)
  loadMore: async () => {
    const { hasMore, isLoading, currentPage, filters, sort } = get();
    
    if (!hasMore || isLoading) return;
    
    await get().fetchProducts(currentPage + 1, filters, sort);
  },

  // Utilities
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    products: [],
    featured: [],
    currentProduct: null,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMore: false,
    filters: {},
    sort: { field: "newest", direction: "desc" },
    searchQuery: "",
    lastFetch: 0,
  }),
}));

// Initialize favorites on store creation
if (typeof window !== 'undefined') {
  useProductStore.getState().loadFavorites();
  
  // Load search history
  try {
    const stored = localStorage.getItem('sikupi-search-history');
    if (stored) {
      const searchHistory = JSON.parse(stored);
      useProductStore.setState({ searchHistory });
    }
  } catch (error) {
    console.warn('Failed to load search history:', error);
  }
}