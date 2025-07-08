import { create } from "zustand";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  weight: number; // in kg
  category: string;
  grade: "A" | "B" | "C";
  images: string[];
  location: string;
  sellerId: string;
  sellerName: string;
  sellerType: "cafe" | "restaurant" | "hotel" | "roastery" | "other";
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional metadata
  moistureContent?: number;
  ph?: number;
  organicCertified?: boolean;
  shippingWeight?: number;
  minOrder?: number;
  processingTime?: string;
}

export interface ProductFilters {
  query?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  grade?: "A" | "B" | "C";
  sellerType?: string;
  minRating?: number;
  inStock?: boolean;
  organicCertified?: boolean;
  verified?: boolean;
}

export interface ProductSort {
  field: "newest" | "oldest" | "price_low" | "price_high" | "rating" | "popularity" | "distance";
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
  categories: Array<{ id: string; name: string; count: number }>;
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination & Filters
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  filters: ProductFilters;
  sort: ProductSort;
  
  // Search
  searchQuery: string;
  searchHistory: string[];
  suggestions: string[];
  
  // Favorites
  favorites: string[];

  // Actions
  setProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  
  // Fetching
  fetchProducts: (page?: number, filters?: ProductFilters, sort?: ProductSort) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  
  // Filters & Search
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: ProductSort) => void;
  setSearchQuery: (query: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // Favorites
  toggleFavorite: (productId: string) => void;
  setFavorites: (favorites: string[]) => void;
  
  // Utilities
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
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
  hasMore: false,
  filters: {},
  sort: { field: "newest", direction: "desc" },
  
  searchQuery: "",
  searchHistory: [],
  suggestions: [],
  
  favorites: [],

  // Basic setters
  setProducts: (products) => set({ products }),
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

  // Fetching functions
  fetchProducts: async (page = 1, filters = {}, sort = { field: "newest", direction: "desc" }) => {
    set({ isLoading: true, error: null });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy: sort.field,
        sortDirection: sort.direction,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      // TODO: Replace with actual API call
      const response = await fetch(`/api/products?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: ProductListResponse = await response.json();
      
      set({
        products: page === 1 ? data.products : [...get().products, ...data.products],
        currentPage: data.page,
        totalPages: Math.ceil(data.total / data.limit),
        hasMore: data.hasMore,
        filters: { ...get().filters, ...filters },
        sort,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch products",
        isLoading: false,
      });
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/products/featured");
      
      if (!response.ok) {
        throw new Error("Failed to fetch featured products");
      }

      const data = await response.json();
      set({ featured: data.products });
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error("Product not found");
      }

      const product = await response.json();
      set({ currentProduct: product, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch product",
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/products/categories");
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      set({ categories: data.categories });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },

  searchProducts: async (query) => {
    if (!query.trim()) {
      get().fetchProducts();
      return;
    }

    set({ isLoading: true, error: null, searchQuery: query });
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      set({
        products: data.products,
        isLoading: false,
      });

      // Add to search history
      get().addToSearchHistory(query);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Search failed",
        isLoading: false,
      });
    }
  },

  // Filter and search actions
  setFilters: (newFilters) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({ filters: updatedFilters });
    get().fetchProducts(1, updatedFilters, get().sort);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchProducts(1, {}, get().sort);
  },

  setSort: (sort) => {
    set({ sort });
    get().fetchProducts(1, get().filters, sort);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  addToSearchHistory: (query) => {
    const { searchHistory } = get();
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
    set({ searchHistory: newHistory });
  },

  clearSearchHistory: () => set({ searchHistory: [] }),

  // Favorites
  toggleFavorite: (productId) => {
    const { favorites } = get();
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    set({ favorites: newFavorites });
    
    // Update product in list
    get().updateProduct(productId, { isFavorite: newFavorites.includes(productId) });
    
    // TODO: Sync with backend
  },

  setFavorites: (favorites) => set({ favorites }),

  // Utilities
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    products: [],
    currentProduct: null,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    filters: {},
    sort: { field: "newest", direction: "desc" },
    searchQuery: "",
  }),
}));