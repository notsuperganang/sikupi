import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';

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

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    title: string;
    totalSold: number;
    revenue: number;
    image: string;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
  }>;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  topPerforming: Array<{
    id: string;
    title: string;
    views: number;
    sold: number;
    revenue: number;
    rating: number;
    image: string;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    title: string;
    currentStock: number;
    minStock: number;
    image: string;
  }>;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageOrdersPerCustomer: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    avatar?: string;
  }>;
  customersByLocation: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  acquisitionChannels: Array<{
    channel: string;
    customers: number;
    percentage: number;
  }>;
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

export interface ImpactMetrics {
  totalCoffeeWasteRecycled: number; // in kg
  totalCO2Reduced: number; // in kg
  totalWaterSaved: number; // in liters
  treesEquivalent: number;
  impactByMonth: Array<{
    month: string;
    wasteRecycled: number;
    co2Reduced: number;
    waterSaved: number;
  }>;
  wasteByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  environmentalScore: number;
  sustainability: {
    carbonFootprint: number;
    energySaved: number;
    wasteReduction: number;
  };
}

export const dashboardService = {
  // Get general dashboard metrics
  getMetrics: async (): Promise<DashboardMetrics> => {
    return api.get<DashboardMetrics>(API_ENDPOINTS.DASHBOARD.METRICS);
  },

  // Get sales analytics
  getSalesAnalytics: async (period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<SalesAnalytics> => {
    return api.get<SalesAnalytics>(`${API_ENDPOINTS.DASHBOARD.ANALYTICS}/sales?period=${period}`);
  },

  // Get product analytics
  getProductAnalytics: async (): Promise<ProductAnalytics> => {
    return api.get<ProductAnalytics>(`${API_ENDPOINTS.DASHBOARD.ANALYTICS}/products`);
  },

  // Get customer analytics
  getCustomerAnalytics: async (period: 'week' | 'month' | 'year' = 'month'): Promise<CustomerAnalytics> => {
    return api.get<CustomerAnalytics>(`${API_ENDPOINTS.DASHBOARD.ANALYTICS}/customers?period=${period}`);
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 10): Promise<RecentActivity> => {
    return api.get<RecentActivity>(`/api/dashboard/activity?limit=${limit}`);
  },

  // Get impact metrics
  getImpactMetrics: async (): Promise<ImpactMetrics> => {
    return api.get<ImpactMetrics>('/api/dashboard/impact');
  },

  // Get revenue trend
  getRevenueTrend: async (period: 'week' | 'month' | 'year' = 'month'): Promise<{
    trend: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    growth: number;
    total: number;
  }> => {
    return api.get<{
      trend: Array<{
        date: string;
        revenue: number;
        orders: number;
      }>;
      growth: number;
      total: number;
    }>(`/api/dashboard/revenue-trend?period=${period}`);
  },

  // Get order status distribution
  getOrderStatusDistribution: async (): Promise<{
    distribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    total: number;
  }> => {
    return api.get<{
      distribution: Array<{
        status: string;
        count: number;
        percentage: number;
      }>;
      total: number;
    }>('/api/dashboard/order-status');
  },

  // Get performance metrics
  getPerformanceMetrics: async (): Promise<{
    conversionRate: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    returnCustomerRate: number;
    averageDeliveryTime: number;
    customerSatisfactionScore: number;
    trendData: Array<{
      metric: string;
      current: number;
      previous: number;
      change: number;
    }>;
  }> => {
    return api.get<{
      conversionRate: number;
      averageOrderValue: number;
      customerLifetimeValue: number;
      returnCustomerRate: number;
      averageDeliveryTime: number;
      customerSatisfactionScore: number;
      trendData: Array<{
        metric: string;
        current: number;
        previous: number;
        change: number;
      }>;
    }>('/api/dashboard/performance');
  },

  // Get inventory alerts
  getInventoryAlerts: async (): Promise<{
    lowStock: Array<{
      id: string;
      title: string;
      currentStock: number;
      minStock: number;
      status: 'low' | 'out';
    }>;
    totalAlerts: number;
  }> => {
    return api.get<{
      lowStock: Array<{
        id: string;
        title: string;
        currentStock: number;
        minStock: number;
        status: 'low' | 'out';
      }>;
      totalAlerts: number;
    }>('/api/dashboard/inventory-alerts');
  },

  // Export dashboard data
  exportData: async (type: 'sales' | 'products' | 'customers' | 'orders', format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await api.get(`/api/dashboard/export?type=${type}&format=${format}`, {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  },
};