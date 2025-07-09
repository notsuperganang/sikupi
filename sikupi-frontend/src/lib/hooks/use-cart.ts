// FILE: src/lib/hooks/use-cart.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockCartService } from "@/lib/mock/complete-mock-services";
import { toast } from "sonner";
import type { AddToCartRequest, UpdateCartItemRequest } from "@/lib/types/cart";

// Query keys
export const cartKeys = {
  all: ["cart"] as const,
  cart: () => [...cartKeys.all, "items"] as const,
  count: () => [...cartKeys.all, "count"] as const,
};

// Get cart items
export function useCart() {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => mockCartService.getCart(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Get cart count
export function useCartCount() {
  const cartQuery = useCart();
  
  return {
    ...cartQuery,
    data: cartQuery.data ? {
      count: cartQuery.data.cart.totalItems,
      totalItems: cartQuery.data.cart.totalItems,
    } : { count: 0, totalItems: 0 },
  };
}

// Add item to cart mutation
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartRequest) => mockCartService.addToCart(data),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.cart(), response);
      toast.success("Produk ditambahkan ke keranjang", {
        description: "Anda bisa melihat keranjang di pojok kanan atas",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menambahkan ke keranjang", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Update cart item mutation
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemRequest }) => 
      mockCartService.updateCartItem(itemId, data),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.cart(), response);
      toast.success("Keranjang berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui keranjang", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Remove cart item mutation
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => mockCartService.removeCartItem(itemId),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.cart(), response);
      toast.success("Produk dihapus dari keranjang");
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus produk", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Clear cart mutation
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mockCartService.clearCart(),
    onSuccess: (response) => {
      queryClient.setQueryData(cartKeys.cart(), response);
      toast.success("Keranjang berhasil dikosongkan");
    },
    onError: (error: any) => {
      toast.error("Gagal mengosongkan keranjang", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}