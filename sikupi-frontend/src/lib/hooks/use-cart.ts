"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService, type AddToCartRequest, type UpdateCartItemRequest, type ApplyDiscountRequest, type CalculateShippingRequest } from "@/lib/api";
import { toast } from "sonner";

// Query keys
export const cartKeys = {
  all: ["cart"] as const,
  cart: () => [...cartKeys.all, "items"] as const,
  count: () => [...cartKeys.all, "count"] as const,
  coupons: () => [...cartKeys.all, "coupons"] as const,
  shipping: (destination: any) => [...cartKeys.all, "shipping", destination] as const,
};

// Get cart items
export function useCart() {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => cartService.getCart(),
    staleTime: 0, // Always fresh for cart data
  });
}

// Get cart count (for header badge)
export function useCartCount() {
  return useQuery({
    queryKey: cartKeys.count(),
    queryFn: () => cartService.getCartCount(),
    staleTime: 0, // Always fresh for cart count
  });
}

// Get available coupons
export function useAvailableCoupons() {
  return useQuery({
    queryKey: cartKeys.coupons(),
    queryFn: () => cartService.getAvailableCoupons(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Add item to cart mutation
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => cartService.addToCart(data),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      
      toast.success("Produk ditambahkan ke keranjang!", {
        description: `${data.item.title} berhasil ditambahkan.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menambahkan ke keranjang", {
        description: error.message || "Terjadi kesalahan saat menambahkan produk.",
      });
    },
  });
}

// Update cart item mutation
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemRequest }) => 
      cartService.updateCartItem(itemId, data),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      
      toast.success("Keranjang diperbarui!", {
        description: `${data.item.title} berhasil diperbarui.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui keranjang", {
        description: error.message || "Terjadi kesalahan saat memperbarui keranjang.",
      });
    },
  });
}

// Remove item from cart mutation
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeFromCart(itemId),
    onSuccess: () => {
      // Update cart cache
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      
      toast.success("Produk dihapus dari keranjang!", {
        description: "Produk berhasil dihapus dari keranjang.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus dari keranjang", {
        description: error.message || "Terjadi kesalahan saat menghapus produk.",
      });
    },
  });
}

// Clear cart mutation
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      // Update cart cache
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      
      toast.success("Keranjang dikosongkan!", {
        description: "Semua produk telah dihapus dari keranjang.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal mengosongkan keranjang", {
        description: error.message || "Terjadi kesalahan saat mengosongkan keranjang.",
      });
    },
  });
}

// Apply discount mutation
export function useApplyDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyDiscountRequest) => cartService.applyDiscount(data),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      
      toast.success("Diskon berhasil diterapkan!", {
        description: `Kode ${data.discount.code} berhasil digunakan.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menerapkan diskon", {
        description: error.message || "Kode diskon tidak valid atau sudah kadaluarsa.",
      });
    },
  });
}

// Remove discount mutation
export function useRemoveDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeDiscount(),
    onSuccess: () => {
      // Update cart cache
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      
      toast.success("Diskon dihapus!", {
        description: "Diskon telah dihapus dari keranjang.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus diskon", {
        description: error.message || "Terjadi kesalahan saat menghapus diskon.",
      });
    },
  });
}

// Calculate shipping mutation
export function useCalculateShipping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CalculateShippingRequest) => cartService.calculateShipping(data),
    onSuccess: (data, variables) => {
      // Cache shipping options
      queryClient.setQueryData(
        cartKeys.shipping(variables.destination),
        data
      );
      
      toast.success("Ongkos kirim berhasil dihitung!", {
        description: `Ditemukan ${data.shippingOptions.length} opsi pengiriman.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menghitung ongkos kirim", {
        description: error.message || "Terjadi kesalahan saat menghitung ongkos kirim.",
      });
    },
  });
}

// Validate cart mutation
export function useValidateCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.validateCart(),
    onSuccess: (data) => {
      // Update cart cache with validation results
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      
      if (!data.valid) {
        toast.warning("Keranjang perlu diperbarui", {
          description: `Ditemukan ${data.issues.length} masalah pada keranjang.`,
        });
      } else {
        toast.success("Keranjang valid!", {
          description: "Semua produk dalam keranjang tersedia.",
        });
      }
    },
    onError: (error: any) => {
      toast.error("Gagal memvalidasi keranjang", {
        description: error.message || "Terjadi kesalahan saat memvalidasi keranjang.",
      });
    },
  });
}

// Sync guest cart mutation (after login)
export function useSyncGuestCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestItems: Array<{ productId: string; quantity: number }>) => 
      cartService.syncGuestCart(guestItems),
    onSuccess: () => {
      // Refresh cart after sync
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      
      toast.success("Keranjang berhasil disinkronkan!", {
        description: "Keranjang Anda telah disinkronkan dengan akun.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menyinkronkan keranjang", {
        description: error.message || "Terjadi kesalahan saat menyinkronkan keranjang.",
      });
    },
  });
}