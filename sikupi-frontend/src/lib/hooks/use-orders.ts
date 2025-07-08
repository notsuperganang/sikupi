"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService, type OrderFilters, type CreateOrderRequest, type UpdateOrderStatusRequest } from "@/lib/api";
import { toast } from "sonner";

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  seller: (filters: OrderFilters) => [...orderKeys.all, "seller", filters] as const,
  stats: (period: string) => [...orderKeys.all, "stats", period] as const,
  tracking: (id: string) => [...orderKeys.all, "tracking", id] as const,
  payment: (id: string) => [...orderKeys.all, "payment", id] as const,
};

// Get orders with filters
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => ordersService.getOrders(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.getOrder(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get seller orders
export function useSellerOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: orderKeys.seller(filters),
    queryFn: () => ordersService.getSellerOrders(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get order statistics
export function useOrderStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: orderKeys.stats(period),
    queryFn: () => ordersService.getOrderStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get order tracking
export function useOrderTracking(id: string) {
  return useQuery({
    queryKey: orderKeys.tracking(id),
    queryFn: () => ordersService.getOrderTracking(id),
    enabled: !!id,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

// Get payment instructions
export function usePaymentInstructions(id: string) {
  return useQuery({
    queryKey: orderKeys.payment(id),
    queryFn: () => ordersService.getPaymentInstructions(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
    onSuccess: (data) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Clear cart after successful order
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      toast.success("Pesanan berhasil dibuat!", {
        description: `Pesanan ${data.order.orderNumber} telah dibuat.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal membuat pesanan", {
        description: error.message || "Terjadi kesalahan saat membuat pesanan.",
      });
    },
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusRequest }) => 
      ordersService.updateOrderStatus(id, data),
    onSuccess: (data, variables) => {
      // Update order detail cache
      queryClient.setQueryData(
        orderKeys.detail(variables.id),
        { order: data.order }
      );
      
      // Invalidate orders lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.seller({}) });
      
      toast.success("Status pesanan berhasil diperbarui!", {
        description: `Pesanan ${data.order.orderNumber} diperbarui ke ${data.order.status}.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui status pesanan", {
        description: error.message || "Terjadi kesalahan saat memperbarui status.",
      });
    },
  });
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      ordersService.cancelOrder(id, reason),
    onSuccess: (data, variables) => {
      // Update order detail cache
      queryClient.setQueryData(
        orderKeys.detail(variables.id),
        { order: data.order }
      );
      
      // Invalidate orders lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.seller({}) });
      
      toast.success("Pesanan berhasil dibatalkan!", {
        description: `Pesanan ${data.order.orderNumber} telah dibatalkan.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal membatalkan pesanan", {
        description: error.message || "Terjadi kesalahan saat membatalkan pesanan.",
      });
    },
  });
}

// Confirm delivery mutation
export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.confirmDelivery(id),
    onSuccess: (data, id) => {
      // Update order detail cache
      queryClient.setQueryData(
        orderKeys.detail(id),
        { order: data.order }
      );
      
      // Invalidate orders lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      toast.success("Pesanan berhasil dikonfirmasi!", {
        description: `Pesanan ${data.order.orderNumber} telah diterima.`,
      });
    },
    onError: (error: any) => {
      toast.error("Gagal mengkonfirmasi pesanan", {
        description: error.message || "Terjadi kesalahan saat mengkonfirmasi pesanan.",
      });
    },
  });
}

// Upload payment proof mutation
export function useUploadPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, file }: { orderId: string; file: File }) => 
      ordersService.uploadPaymentProof(orderId, file),
    onSuccess: (data, variables) => {
      // Invalidate order detail to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      
      toast.success("Bukti pembayaran berhasil diunggah!", {
        description: "Bukti pembayaran Anda sedang diverifikasi.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal mengunggah bukti pembayaran", {
        description: error.message || "Terjadi kesalahan saat mengunggah file.",
      });
    },
  });
}

// Request refund mutation
export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => 
      ordersService.requestRefund(orderId, reason),
    onSuccess: (data, variables) => {
      // Invalidate order detail to refetch
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
      
      toast.success("Permintaan refund berhasil dikirim!", {
        description: "Permintaan refund Anda sedang diproses.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal mengajukan refund", {
        description: error.message || "Terjadi kesalahan saat mengajukan refund.",
      });
    },
  });
}