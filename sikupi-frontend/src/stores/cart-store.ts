// FILE PATH: /src/stores/cart-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  cartService, 
  type Cart, 
  type CartItem, 
  type AddToCartRequest, 
  type UpdateCartItemRequest,
  type Coupon,
  type ApplyDiscountRequest,
  type CalculateShippingRequest,
  type ShippingOption
} from "@/lib/api";
import { toast } from "sonner";

export type { Cart, CartItem } from "@/lib/api";

interface CartState {
  // Cart data
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Coupons and discounts
  availableCoupons: Coupon[];
  appliedCoupon: {
    code: string;
    discountAmount: number;
    discountType: string;
  } | null;
  
  // Shipping
  shippingOptions: ShippingOption[];
  selectedShippingOption: ShippingOption | null;
  shippingCost: number;
  
  // Computed values
  subtotal: number;
  totalAmount: number;
  totalWeight: number;
  
  // Actions
  fetchCart: () => Promise<void>;
  fetchCartCount: () => Promise<void>;
  addItem: (item: AddToCartRequest) => Promise<void>;
  updateItem: (itemId: string, data: UpdateCartItemRequest) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Coupon actions
  fetchCoupons: () => Promise<void>;
  applyDiscount: (data: ApplyDiscountRequest) => Promise<void>;
  removeCoupon: () => void;
  
  // Shipping actions
  calculateShipping: (data: CalculateShippingRequest) => Promise<void>;
  selectShippingOption: (option: ShippingOption) => void;
  
  // Utility actions
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  updateTotals: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      cartCount: 0,
      isLoading: false,
      error: null,
      
      availableCoupons: [],
      appliedCoupon: null,
      
      shippingOptions: [],
      selectedShippingOption: null,
      shippingCost: 0,
      
      subtotal: 0,
      totalAmount: 0,
      totalWeight: 0,

      // Fetch current cart
      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const cart = await cartService.getCart();
          
          set({ cart, isLoading: false });
          get().updateTotals();
          get().fetchCartCount();
        } catch (error: any) {
          console.error('Failed to fetch cart:', error);
          set({ 
            error: error.message || 'Failed to fetch cart', 
            isLoading: false 
          });
        }
      },

      // Fetch cart count only
      fetchCartCount: async () => {
        try {
          const response = await cartService.getCartCount();
          set({ cartCount: response.totalItems });
        } catch (error: any) {
          console.error('Failed to fetch cart count:', error);
          // Don't set error for count fetch failures
        }
      },

      // Add item to cart
      addItem: async (item: AddToCartRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await cartService.addToCart(item);
          
          set({ 
            cart: response.cart, 
            isLoading: false 
          });
          
          get().updateTotals();
          get().fetchCartCount();
          
          toast.success("Produk berhasil ditambahkan ke keranjang!");
        } catch (error: any) {
          console.error('Failed to add item to cart:', error);
          set({ 
            error: error.message || 'Failed to add item to cart', 
            isLoading: false 
          });
          toast.error("Gagal menambahkan produk ke keranjang");
          throw error;
        }
      },

      // Update cart item
      updateItem: async (itemId: string, data: UpdateCartItemRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await cartService.updateCartItem(itemId, data);
          
          set({ 
            cart: response.cart, 
            isLoading: false 
          });
          
          get().updateTotals();
          get().fetchCartCount();
          
          toast.success("Keranjang berhasil diperbarui!");
        } catch (error: any) {
          console.error('Failed to update cart item:', error);
          set({ 
            error: error.message || 'Failed to update cart item', 
            isLoading: false 
          });
          toast.error("Gagal memperbarui keranjang");
          throw error;
        }
      },

      // Remove item from cart
      removeItem: async (itemId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await cartService.removeCartItem(itemId);
          
          set({ 
            cart: response.cart, 
            isLoading: false 
          });
          
          get().updateTotals();
          get().fetchCartCount();
          
          toast.success("Produk berhasil dihapus dari keranjang!");
        } catch (error: any) {
          console.error('Failed to remove cart item:', error);
          set({ 
            error: error.message || 'Failed to remove cart item', 
            isLoading: false 
          });
          toast.error("Gagal menghapus produk dari keranjang");
          throw error;
        }
      },

      // Clear entire cart
      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await cartService.clearCart();
          
          set({ 
            cart: response.cart, 
            isLoading: false,
            appliedCoupon: null,
            selectedShippingOption: null,
            shippingCost: 0
          });
          
          get().updateTotals();
          get().fetchCartCount();
          
          toast.success("Keranjang berhasil dikosongkan!");
        } catch (error: any) {
          console.error('Failed to clear cart:', error);
          set({ 
            error: error.message || 'Failed to clear cart', 
            isLoading: false 
          });
          toast.error("Gagal mengosongkan keranjang");
          throw error;
        }
      },

      // Fetch available coupons
      fetchCoupons: async () => {
        try {
          const response = await cartService.getAvailableCoupons();
          set({ availableCoupons: response.coupons });
        } catch (error: any) {
          console.error('Failed to fetch coupons:', error);
          // Don't show error toast for coupons
        }
      },

      // Apply discount coupon
      applyDiscount: async (data: ApplyDiscountRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await cartService.applyDiscount(data);
          
          set({ 
            cart: response.cart,
            appliedCoupon: {
              code: response.discount.couponCode,
              discountAmount: response.discount.discountAmount,
              discountType: response.discount.discountType,
            },
            isLoading: false 
          });
          
          get().updateTotals();
          
          toast.success("Kupon berhasil diterapkan!");
        } catch (error: any) {
          console.error('Failed to apply discount:', error);
          set({ 
            error: error.message || 'Failed to apply discount', 
            isLoading: false 
          });
          toast.error("Gagal menerapkan kupon");
          throw error;
        }
      },

      // Remove applied coupon
      removeCoupon: () => {
        set({ appliedCoupon: null });
        get().updateTotals();
        toast.success("Kupon berhasil dihapus!");
      },

      // Calculate shipping options
      calculateShipping: async (data: CalculateShippingRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await cartService.calculateShipping(data);
          
          set({ 
            shippingOptions: response.shippingOptions,
            isLoading: false 
          });
          
          if (response.shippingOptions.length > 0) {
            toast.success("Opsi pengiriman berhasil dimuat!");
          }
        } catch (error: any) {
          console.error('Failed to calculate shipping:', error);
          set({ 
            error: error.message || 'Failed to calculate shipping', 
            isLoading: false 
          });
          toast.error("Gagal menghitung ongkos kirim");
        }
      },

      // Select shipping option
      selectShippingOption: (option: ShippingOption) => {
        set({ 
          selectedShippingOption: option,
          shippingCost: option.price 
        });
        get().updateTotals();
      },

      // Get quantity of specific product in cart
      getItemQuantity: (productId: string): number => {
        const { cart } = get();
        if (!cart) return 0;
        
        const item = cart.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
      },

      // Check if product is in cart
      isInCart: (productId: string): boolean => {
        const { cart } = get();
        if (!cart) return false;
        
        return cart.items.some(item => item.productId === productId);
      },

      // Update calculated totals
      updateTotals: () => {
        const { cart, appliedCoupon, shippingCost } = get();
        
        if (!cart) {
          set({ 
            subtotal: 0, 
            totalAmount: 0, 
            totalWeight: 0 
          });
          return;
        }

        const subtotal = cart.totalPrice || 0;
        const totalWeight = cart.totalWeight || 0;
        const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
        const totalAmount = subtotal - discountAmount + shippingCost;

        set({ 
          subtotal, 
          totalAmount: Math.max(0, totalAmount), 
          totalWeight 
        });
      },

      // Set error state
      setError: (error: string | null) => {
        set({ error });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'sikupi-cart',
      // Only persist non-sensitive cart data
      partialize: (state) => ({
        appliedCoupon: state.appliedCoupon,
        selectedShippingOption: state.selectedShippingOption,
        shippingCost: state.shippingCost,
      }),
    }
  )
);

// Selector hooks for better performance
export const useCartCount = () => useCartStore((state) => state.cartCount);
export const useCartItems = () => useCartStore((state) => state.cart?.items || []);
export const useCartTotals = () => useCartStore((state) => ({
  subtotal: state.subtotal,
  totalAmount: state.totalAmount,
  totalWeight: state.totalWeight,
  discountAmount: state.appliedCoupon?.discountAmount || 0,
  shippingCost: state.shippingCost,
}));
export const useCartLoading = () => useCartStore((state) => state.isLoading);
export const useCartError = () => useCartStore((state) => state.error);