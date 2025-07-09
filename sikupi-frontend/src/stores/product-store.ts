// FILE: src/stores/product-store.ts
"use client";

import { create } from "zustand";
import type { Product, ProductFilters } from "@/lib/types/product";

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  filters: ProductFilters;
  searchQuery: string;
  isLoading: boolean;
  lastUpdated: string | null;
}

interface ProductActions {
  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  setFilters: (filters: ProductFilters) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  updateLastUpdated: () => void;
  clearProducts: () => void;
}

export const useProductStore = create<ProductState & ProductActions>((set) => ({
  // Initial state
  products: [],
  featuredProducts: [],
  currentProduct: null,
  filters: {},
  searchQuery: "",
  isLoading: false,
  lastUpdated: null,

  // Actions
  setProducts: (products) => set({ 
    products,
    lastUpdated: new Date().toISOString()
  }),
  
  setFeaturedProducts: (products) => set({ 
    featuredProducts: products,
    lastUpdated: new Date().toISOString()
  }),
  
  setCurrentProduct: (product) => set({ 
    currentProduct: product,
    lastUpdated: new Date().toISOString()
  }),
  
  setFilters: (filters) => set({ 
    filters,
    lastUpdated: new Date().toISOString()
  }),
  
  setSearchQuery: (query) => set({ 
    searchQuery: query,
    lastUpdated: new Date().toISOString()
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  updateLastUpdated: () => set({ 
    lastUpdated: new Date().toISOString()
  }),
  
  clearProducts: () => set({
    products: [],
    featuredProducts: [],
    currentProduct: null,
    filters: {},
    searchQuery: "",
    lastUpdated: new Date().toISOString()
  }),
}));