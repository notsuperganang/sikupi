import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  paymentDetails?: {
    bankTransfer?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      amount: number;
    };
    eWallet?: {
      provider: string;
      accountNumber: string;
    };
  };
  shipping: {
    courier: string;
    service: string;
    trackingNumber?: string;
    cost: number;
    estimatedDays: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  weight: number;
  image: string;
  sellerId: string;
  sellerName: string;
  grade: 'A' | 'B' | 'C';
  category: string;
  subtotal: number;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalOrders: number;
    totalAmount: number;
    statusCounts: {
      pending: number;
      paid: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  shippingOption: {
    courier: string;
    service: string;
    cost: number;
    estimatedDays: string;
  };
  notes?: string;
  discountCode?: string;
}

export interface CreateOrderResponse {
  order: Order;
  paymentInstructions?: {
    bankTransfer?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      amount: number;
      expiredAt: string;
    };
    eWallet?: {
      provider: string;
      deepLink: string;
      qrCode: string;
    };
  };
  message: string;
}

export interface UpdateOrderStatusRequest {
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
}

export interface UpdateOrderStatusResponse {
  order: Order;
  message: string;
}

export const ordersService = {
  // Get all orders with filters
  getOrders: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.ORDERS.LIST}?${queryString}` : API_ENDPOINTS.ORDERS.LIST;
    
    return api.get<OrdersResponse>(url);
  },

  // Get order by ID
  getOrder: async (id: string): Promise<{ order: Order }> => {
    return api.get<{ order: Order }>(`${API_ENDPOINTS.ORDERS.DETAIL}/${id}`);
  },

  // Create new order
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    return api.post<CreateOrderResponse>(API_ENDPOINTS.ORDERS.CREATE, data);
  },

  // Update order status (for sellers)
  updateOrderStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResponse> => {
    return api.put<UpdateOrderStatusResponse>(`/api/transactions/${id}/status`, data);
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string): Promise<{ order: Order; message: string }> => {
    return api.put<{ order: Order; message: string }>(`/api/transactions/${id}/cancel`, { reason });
  },

  // Confirm order delivery (for buyers)
  confirmDelivery: async (id: string): Promise<{ order: Order; message: string }> => {
    return api.put<{ order: Order; message: string }>(`/api/transactions/${id}/confirm-delivery`);
  },

  // Get order tracking info
  getOrderTracking: async (id: string): Promise<{
    trackingNumber: string;
    courier: string;
    service: string;
    status: string;
    history: Array<{
      date: string;
      status: string;
      description: string;
      location?: string;
    }>;
  }> => {
    return api.get<{
      trackingNumber: string;
      courier: string;
      service: string;
      status: string;
      history: Array<{
        date: string;
        status: string;
        description: string;
        location?: string;
      }>;
    }>(`/api/transactions/${id}/tracking`);
  },

  // Get order statistics
  getOrderStats: async (period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: {
      pending: number;
      paid: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
    revenueByPeriod: Array<{
      period: string;
      revenue: number;
      orders: number;
    }>;
  }> => {
    return api.get<{
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      ordersByStatus: {
        pending: number;
        paid: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
      };
      revenueByPeriod: Array<{
        period: string;
        revenue: number;
        orders: number;
      }>;
    }>(`/api/transactions/stats?period=${period}`);
  },

  // Upload payment proof
  uploadPaymentProof: async (orderId: string, file: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('paymentProof', file);

    return api.post<{ message: string }>(
      `/api/transactions/${orderId}/payment-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Get payment instructions
  getPaymentInstructions: async (orderId: string): Promise<{
    paymentMethod: string;
    instructions: {
      bankTransfer?: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        amount: number;
        expiredAt: string;
      };
      eWallet?: {
        provider: string;
        deepLink: string;
        qrCode: string;
      };
    };
  }> => {
    return api.get<{
      paymentMethod: string;
      instructions: {
        bankTransfer?: {
          bankName: string;
          accountName: string;
          accountNumber: string;
          amount: number;
          expiredAt: string;
        };
        eWallet?: {
          provider: string;
          deepLink: string;
          qrCode: string;
        };
      };
    }>(`/api/transactions/${orderId}/payment-instructions`);
  },

  // Request refund
  requestRefund: async (orderId: string, reason: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>(`/api/transactions/${orderId}/refund`, { reason });
  },

  // Get seller orders (orders where user is the seller)
  getSellerOrders: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString 
      ? `/api/transactions/seller?${queryString}`
      : `/api/transactions/seller`;
    
    return api.get<OrdersResponse>(url);
  },
};