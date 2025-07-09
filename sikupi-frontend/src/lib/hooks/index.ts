// Export all hooks
export * from './use-products';
export * from './use-cart';
export * from './use-orders';

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