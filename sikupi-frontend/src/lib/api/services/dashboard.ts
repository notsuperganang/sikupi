// FILE PATH: /sikupi-frontend/src/lib/api/services/dashboard.ts

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';

// Types that match the expected frontend structure
export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  monthlyGrowth: {
    sales: number;
    orders: number;
    revenue: number;
  };
}

export interface RecentActivity {
  orders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    title: string;
    action: 'created' | 'updated' | 'sold';
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    productId: string;
    productTitle: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

// Helper function to create mock data when endpoints are not available
function createMockMetrics(): DashboardMetrics {
  return {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    activeProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyGrowth: {
      sales: 0,
      orders: 0,
      revenue: 0,
    },
  };
}

function createMockActivity(): RecentActivity {
  return {
    orders: [],
    products: [],
    reviews: [],
  };
}

// Map backend response to frontend expected format
function mapBackendMetrics(backendData: any): DashboardMetrics {
  // If backend returns the data in a different format, map it here
  if (!backendData) return createMockMetrics();

  return {
    totalSales: backendData.total_sales || backendData.totalSales || 0,
    totalOrders: backendData.total_orders || backendData.totalOrders || 0,
    totalProducts: backendData.total_products || backendData.totalProducts || 0,
    totalRevenue: backendData.total_revenue || backendData.totalRevenue || 0,
    totalCustomers: backendData.total_customers || backendData.totalCustomers || 0,
    averageOrderValue: backendData.average_order_value || backendData.averageOrderValue || 0,
    conversionRate: backendData.conversion_rate || backendData.conversionRate || 0,
    activeProducts: backendData.active_products || backendData.activeProducts || 0,
    pendingOrders: backendData.pending_orders || backendData.pendingOrders || 0,
    completedOrders: backendData.completed_orders || backendData.completedOrders || 0,
    monthlyGrowth: {
      sales: backendData.monthly_growth?.sales || backendData.monthlyGrowth?.sales || 0,
      orders: backendData.monthly_growth?.orders || backendData.monthlyGrowth?.orders || 0,
      revenue: backendData.monthly_growth?.revenue || backendData.monthlyGrowth?.revenue || 0,
    },
  };
}

export const dashboardService = {
  // Get general dashboard metrics
  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      console.log('Fetching dashboard metrics...');
      const response = await api.get<any>(API_ENDPOINTS.DASHBOARD.METRICS);
      console.log('Backend metrics response:', response);
      
      // Map backend response to expected format
      const mappedMetrics = mapBackendMetrics(response);
      console.log('Mapped metrics:', mappedMetrics);
      
      return mappedMetrics;
    } catch (error: any) {
      console.warn('Dashboard metrics endpoint not available:', error.message);
      
      // Return mock data if endpoint is not available
      return createMockMetrics();
    }
  },

  // Get recent activity (with fallback to mock data)
  getRecentActivity: async (limit: number = 10): Promise<RecentActivity> => {
    try {
      console.log('Fetching recent activity...');
      const response = await api.get<RecentActivity>(`/api/dashboard/activity?limit=${limit}`);
      return response;
    } catch (error: any) {
      console.warn('Recent activity endpoint not available:', error.message);
      
      // Return mock activity data
      return createMockActivity();
    }
  },

  // Sales analytics (mock implementation for now)
  getSalesAnalytics: async (period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<any> => {
    try {
      const response = await api.get<any>(`/api/dashboard/sales-analytics?period=${period}`);
      return response;
    } catch (error: any) {
      console.warn('Sales analytics endpoint not available:', error.message);
      
      // Return mock sales data
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueByPeriod: [],
        topProducts: [],
        revenueByCategory: [],
        customerSegments: [],
      };
    }
  },

  // Product analytics (mock implementation)
  getProductAnalytics: async (): Promise<any> => {
    try {
      const response = await api.get<any>('/api/dashboard/product-analytics');
      return response;
    } catch (error: any) {
      console.warn('Product analytics endpoint not available:', error.message);
      
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        outOfStockProducts: 0,
        topPerforming: [],
        categoryDistribution: [],
        gradeDistribution: [],
        lowStockProducts: [],
      };
    }
  },

  // Customer analytics (mock implementation)
  getCustomerAnalytics: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any> => {
    try {
      const response = await api.get<any>(`/api/dashboard/customer-analytics?period=${period}`);
      return response;
    } catch (error: any) {
      console.warn('Customer analytics endpoint not available:', error.message);
      
      return {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        customerRetentionRate: 0,
        averageOrdersPerCustomer: 0,
        topCustomers: [],
        customersByLocation: [],
        acquisitionChannels: [],
      };
    }
  },

  // Impact metrics (mock implementation)
  getImpactMetrics: async (): Promise<any> => {
    try {
      const response = await api.get<any>('/api/dashboard/impact');
      return response;
    } catch (error: any) {
      console.warn('Impact metrics endpoint not available:', error.message);
      
      return {
        totalCoffeeWasteRecycled: 0,
        totalCO2Reduced: 0,
        totalWaterSaved: 0,
        treesEquivalent: 0,
        impactByMonth: [],
        wasteByCategory: [],
        environmentalScore: 0,
        sustainability: {
          carbonFootprint: 0,
          energySaved: 0,
          wasteReduction: 0,
        },
      };
    }
  },

  // Revenue trend (mock implementation)
  getRevenueTrend: async (period: 'week' | 'month' | 'year' = 'month'): Promise<any> => {
    try {
      const response = await api.get<any>(`/api/dashboard/revenue-trend?period=${period}`);
      return response;
    } catch (error: any) {
      console.warn('Revenue trend endpoint not available:', error.message);
      
      return {
        trend: [],
        growth: 0,
        total: 0,
      };
    }
  },

  // Order status distribution (mock implementation)
  getOrderStatusDistribution: async (): Promise<any> => {
    try {
      const response = await api.get<any>('/api/dashboard/order-status');
      return response;
    } catch (error: any) {
      console.warn('Order status distribution endpoint not available:', error.message);
      
      return {
        distribution: [],
        total: 0,
      };
    }
  },

  // Performance metrics (mock implementation)
  getPerformanceMetrics: async (): Promise<any> => {
    try {
      const response = await api.get<any>('/api/dashboard/performance');
      return response;
    } catch (error: any) {
      console.warn('Performance metrics endpoint not available:', error.message);
      
      return {
        conversionRate: 0,
        averageOrderValue: 0,
        customerLifetimeValue: 0,
        returnCustomerRate: 0,
        averageDeliveryTime: 0,
        customerSatisfactionScore: 0,
        trendData: [],
      };
    }
  },

  // Inventory alerts (mock implementation)
  getInventoryAlerts: async (): Promise<any> => {
    try {
      const response = await api.get<any>('/api/dashboard/inventory-alerts');
      return response;
    } catch (error: any) {
      console.warn('Inventory alerts endpoint not available:', error.message);
      
      return {
        lowStock: [],
        totalAlerts: 0,
      };
    }
  },

  // Export data (mock implementation)
  exportData: async (type: 'sales' | 'products' | 'customers' | 'orders', format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    try {
      const response = await api.get(`/api/dashboard/export?type=${type}&format=${format}`, {
        responseType: 'blob',
      });
      return response as unknown as Blob;
    } catch (error: any) {
      console.warn('Export data endpoint not available:', error.message);
      
      // Return empty blob
      return new Blob([''], { type: 'text/plain' });
    }
  },
};