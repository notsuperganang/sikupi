import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  weight: number;
  image: string;
  sellerId: string;
  sellerName: string;
  location: string;
  grade: "A" | "B" | "C";
  stock: number;
}

export interface CartSummary {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  totalItems: number;
  totalWeight: number;
}

interface CartState {
  // State
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Computed
  summary: CartSummary;

  // Actions
  addItem: (product: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  loadCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  applyDiscount: (discountCode: string) => Promise<void>;
  calculateShipping: (destination: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,

      // Computed summary
      get summary(): CartSummary {
        const items = get().items;
        
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
        
        // Simple calculation - can be enhanced with actual shipping API
        const shippingCost = totalWeight > 0 ? Math.max(10000, totalWeight * 2000) : 0;
        const tax = subtotal * 0.11; // 11% PPN
        const discount = 0; // Will be calculated when discount is applied
        const total = subtotal + shippingCost + tax - discount;

        return {
          subtotal,
          shippingCost,
          tax,
          discount,
          total,
          totalItems,
          totalWeight,
        };
      },

      // Actions
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.productId === product.productId);

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
          set({
            items: items.map(item =>
              item.productId === product.productId
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            ...product,
            id: `cart_${Date.now()}_${Math.random()}`,
            quantity: Math.min(quantity, product.stock),
          };
          
          set({
            items: [...items, newItem],
          });
        }

        // Sync with server (if user is authenticated)
        get().syncCart();
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.productId !== productId),
        });
        get().syncCart();
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          ),
        });
        get().syncCart();
      },

      clearCart: () => {
        set({ items: [] });
        get().syncCart();
      },

      getItemQuantity: (productId) => {
        const item = get().items.find(item => item.productId === productId);
        return item?.quantity || 0;
      },

      isInCart: (productId) => {
        return get().items.some(item => item.productId === productId);
      },

      loadCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Replace with actual API call
          // For now, cart is loaded from localStorage via persist middleware
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Gagal memuat keranjang",
            isLoading: false,
          });
        }
      },

      syncCart: async () => {
        // Only sync if user is authenticated
        try {
          // TODO: Replace with actual API call
          const items = get().items;
          
          // Example API call structure:
          // await fetch("/api/cart/sync", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     "Authorization": `Bearer ${token}`,
          //   },
          //   body: JSON.stringify({ items }),
          // });
        } catch (error) {
          console.error("Failed to sync cart:", error);
          // Don't throw error to avoid disrupting user experience
        }
      },

      applyDiscount: async (discountCode) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Replace with actual API call
          const response = await fetch("/api/cart/apply-discount", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              code: discountCode,
              items: get().items,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Kode diskon tidak valid");
          }

          const data = await response.json();
          
          // Update cart with discount information
          // This would require extending the CartSummary interface
          set({ isLoading: false });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Gagal menerapkan diskon",
            isLoading: false,
          });
          throw error;
        }
      },

      calculateShipping: async (destination) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Replace with actual shipping API call (e.g., Biteship)
          const items = get().items;
          const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
          
          const response = await fetch("/api/shipping/calculate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              destination,
              weight: totalWeight,
              items,
            }),
          });

          if (!response.ok) {
            throw new Error("Gagal menghitung ongkos kirim");
          }

          const data = await response.json();
          
          // Update shipping cost in summary
          // This would require modifying how summary is calculated
          set({ isLoading: false });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Gagal menghitung ongkos kirim",
            isLoading: false,
          });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: "sikupi-cart",
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);