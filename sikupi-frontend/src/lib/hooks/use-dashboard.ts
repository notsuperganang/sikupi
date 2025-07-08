"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/lib/api";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: () => [...dashboardKeys.all, "metrics"] as const,
  sales: (period: string) => [...dashboardKeys.all, "sales", period] as const,
  products: () => [...dashboardKeys.all, "products"] as const,
  customers: (period: string) => [...dashboardKeys.all, "customers", period] as const,
  activity: (limit: number) => [...dashboardKeys.all, "activity", limit] as const,
  impact: () => [...dashboardKeys.all, "impact"] as const,
  revenue: (period: string) => [...dashboardKeys.all, "revenue", period] as const,
  orderStatus: () => [...dashboardKeys.all, "orderStatus"] as const,
  performance: () => [...dashboardKeys.all, "performance"] as const,
  inventory: () => [...dashboardKeys.all, "inventory"] as const,
};

// Get dashboard metrics
export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get sales analytics
export function useSalesAnalytics(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: dashboardKeys.sales(period),
    queryFn: () => dashboardService.getSalesAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get product analytics
export function useProductAnalytics() {
  return useQuery({
    queryKey: dashboardKeys.products(),
    queryFn: () => dashboardService.getProductAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get customer analytics
export function useCustomerAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: dashboardKeys.customers(period),
    queryFn: () => dashboardService.getCustomerAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get recent activity
export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get impact metrics
export function useImpactMetrics() {
  return useQuery({
    queryKey: dashboardKeys.impact(),
    queryFn: () => dashboardService.getImpactMetrics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Get revenue trend
export function useRevenueTrend(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: dashboardKeys.revenue(period),
    queryFn: () => dashboardService.getRevenueTrend(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get order status distribution
export function useOrderStatusDistribution() {
  return useQuery({
    queryKey: dashboardKeys.orderStatus(),
    queryFn: () => dashboardService.getOrderStatusDistribution(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get performance metrics
export function usePerformanceMetrics() {
  return useQuery({
    queryKey: dashboardKeys.performance(),
    queryFn: () => dashboardService.getPerformanceMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get inventory alerts
export function useInventoryAlerts() {
  return useQuery({
    queryKey: dashboardKeys.inventory(),
    queryFn: () => dashboardService.getInventoryAlerts(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}