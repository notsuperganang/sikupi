// FILE: src/lib/hooks/use-orders.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockOrdersService } from "@/lib/mock/complete-mock-services";
import { toast } from "sonner";
import type { CreateOrderRequest } from "@/lib/types/orders";

// Query keys for orders
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: any) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  my: (filters?: any) => [...orderKeys.all, "my", filters] as const,
  stats: () => [...orderKeys.all, "stats"] as const,
};

// Get orders with filters
export function useOrders(filters: any = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => mockOrdersService.getOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Get order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => mockOrdersService.getOrder(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Get my orders
export function useMyOrders(filters: any = {}) {
  return useQuery({
    queryKey: orderKeys.my(filters),
    queryFn: () => mockOrdersService.getOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => mockOrdersService.createOrder(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Pesanan berhasil dibuat!", {
        description: `Nomor pesanan: ${response.order.orderNumber}`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal membuat pesanan", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Status pesanan berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui status pesanan", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}