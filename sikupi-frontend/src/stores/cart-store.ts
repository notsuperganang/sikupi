// FILE: src/stores/cart-store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cart } from "@/lib/types/cart";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  lastUpdated: string | null;
}

interface CartActions {
  setCart: (cart: Cart | null) => void;
  setLoading: (loading: boolean) => void;
  clearCart: () => void;
  updateLastUpdated: () => void;
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      lastUpdated: null,

      // Actions
      setCart: (cart) => set({ 
        cart,
        lastUpdated: new Date().toISOString()
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      clearCart: () => set({ 
        cart: null,
        lastUpdated: new Date().toISOString()
      }),
      
      updateLastUpdated: () => set({ 
        lastUpdated: new Date().toISOString()
      }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cart: state.cart,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);