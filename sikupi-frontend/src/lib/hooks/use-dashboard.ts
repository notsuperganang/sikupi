// FILE: src/lib/hooks/use-dashboard.ts (Updated)
"use client";

import { useQuery } from "@tanstack/react-query";
import { mockDashboardService } from "@/lib/mock/complete-mock-services";

// Query keys for dashboard
export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: () => [...dashboardKeys.all, "metrics"] as const,
  recentActivity: () => [...dashboardKeys.all, "recentActivity"] as const,
  analytics: () => [...dashboardKeys.all, "analytics"] as const,
  userStats: () => [...dashboardKeys.all, "userStats"] as const,
};

// Get dashboard metrics
export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => mockDashboardService.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Get recent activity
export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(),
    queryFn: () => mockDashboardService.getRecentActivity(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Get analytics data
export function useAnalytics() {
  return useQuery({
    queryKey: dashboardKeys.analytics(),
    queryFn: () => mockDashboardService.getAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

// Get user stats
export function useUserStats() {
  return useQuery({
    queryKey: dashboardKeys.userStats(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        totalTransactions: 45,
        totalSpent: 2450000,
        totalProducts: 12,
        totalFavorites: 8,
        recentActivity: [
          { type: 'order', description: 'Pesanan baru diterima', date: '2024-07-09' },
          { type: 'product', description: 'Produk baru ditambahkan', date: '2024-07-08' },
        ],
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

// Sales analytics
export function useSalesAnalytics() {
  return useAnalytics();
}

// Product analytics
export function useProductAnalytics() {
  return useAnalytics();
}

// Customer analytics
export function useCustomerAnalytics() {
  return useAnalytics();
}

// Impact metrics
export function useImpactMetrics() {
  return useQuery({
    queryKey: [...dashboardKeys.all, "impact"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        wasteReduced: 2500, // kg
        co2Saved: 1200, // kg CO2
        treesEquivalent: 50,
        farmersBenefited: 125,
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}

// Revenue trend
export function useRevenueTrend() {
  return useAnalytics();
}

// Order status distribution
export function useOrderStatusDistribution() {
  return useQuery({
    queryKey: [...dashboardKeys.all, "orderStatus"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        pending: 15,
        processing: 28,
        shipped: 45,
        delivered: 120,
        cancelled: 8,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Performance metrics
export function usePerformanceMetrics() {
  return useDashboardMetrics();
}

// Inventory alerts
export function useInventoryAlerts() {
  return useQuery({
    queryKey: [...dashboardKeys.all, "inventoryAlerts"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        lowStock: 3,
        outOfStock: 1,
        expiringSoon: 2,
        total: 6,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}