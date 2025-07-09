// FILE: src/lib/hooks/index.ts
// Export all hooks
export * from './use-auth';
export * from './use-products';
export * from './use-cart';
export * from './use-orders';
export * from './use-dashboard';

// Export all dashboard hooks
export {
  useDashboardMetrics,
  useSalesAnalytics,
  useProductAnalytics,
  useCustomerAnalytics,
  useRecentActivity,
  useImpactMetrics,
  useRevenueTrend,
  useOrderStatusDistribution,
  usePerformanceMetrics,
  useInventoryAlerts,
  dashboardKeys,
} from './use-dashboard';