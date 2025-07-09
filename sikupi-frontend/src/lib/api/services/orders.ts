// FILE PATH: /src/lib/api/services/orders.ts

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { 
  Order, 
  OrderItem,
  OrderFilters, 
  CreateOrderRequest, 
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  OrdersResponse,
  OrderStats,
  OrderTracking,
  PaymentInstructions,
  OrderStatus,
  PaymentStatus,
  PaymentMethod
} from '@/lib/types/orders';

// Helper function to map backend order data to frontend format
function mapOrderFromBackend(backendOrder: any): Order {
  return {
    id: backendOrder.id,
    orderNumber: backendOrder.order_number || backendOrder.orderNumber || `ORD-${backendOrder.id}`,
    userId: backendOrder.user_id || backendOrder.userId,
    userName: backendOrder.user_name || backendOrder.userName || 'Unknown User',
    userEmail: backendOrder.user_email || backendOrder.userEmail || '',
    
    // Order items
    items: (backendOrder.items || []).map(mapOrderItemFromBackend),
    totalItems: backendOrder.total_items || backendOrder.totalItems || 0,
    totalWeight: backendOrder.total_weight || backendOrder.totalWeight || 0,
    subtotal: backendOrder.subtotal || 0,
    shippingCost: backendOrder.shipping_cost || backendOrder.shippingCost || 0,
    discountAmount: backendOrder.discount_amount || backendOrder.discountAmount || 0,
    totalAmount: backendOrder.total_amount || backendOrder.totalAmount || 0,
    
    // Status
    status: (backendOrder.status || 'pending') as OrderStatus,
    paymentStatus: (backendOrder.payment_status || backendOrder.paymentStatus || 'pending') as PaymentStatus,
    paymentMethod: (backendOrder.payment_method || backendOrder.paymentMethod || 'bank_transfer') as PaymentMethod,
    
    // Shipping information
    shippingAddress: {
      fullName: backendOrder.shipping_address?.full_name || backendOrder.shippingAddress?.fullName || '',
      phone: backendOrder.shipping_address?.phone || backendOrder.shippingAddress?.phone || '',
      address: backendOrder.shipping_address?.address || backendOrder.shippingAddress?.address || '',
      city: backendOrder.shipping_address?.city || backendOrder.shippingAddress?.city || '',
      province: backendOrder.shipping_address?.province || backendOrder.shippingAddress?.province || '',
      postalCode: backendOrder.shipping_address?.postal_code || backendOrder.shippingAddress?.postalCode || '',
      notes: backendOrder.shipping_address?.notes || backendOrder.shippingAddress?.notes,
    },
    shippingOption: {
      id: backendOrder.shipping_option?.id || backendOrder.shippingOption?.id || '',
      name: backendOrder.shipping_option?.name || backendOrder.shippingOption?.name || '',
      description: backendOrder.shipping_option?.description || backendOrder.shippingOption?.description || '',
      estimatedDays: backendOrder.shipping_option?.estimated_days || backendOrder.shippingOption?.estimatedDays || '',
      price: backendOrder.shipping_option?.price || backendOrder.shippingOption?.price || 0,
      courierCode: backendOrder.shipping_option?.courier_code || backendOrder.shippingOption?.courierCode || '',
      serviceCode: backendOrder.shipping_option?.service_code || backendOrder.shippingOption?.serviceCode || '',
    },
    trackingNumber: backendOrder.tracking_number || backendOrder.trackingNumber,
    
    // Payment information
    paymentDetails: backendOrder.payment_details || backendOrder.paymentDetails ? {
      method: backendOrder.payment_details?.method || backendOrder.paymentDetails?.method,
      transactionId: backendOrder.payment_details?.transaction_id || backendOrder.paymentDetails?.transactionId,
      paidAt: backendOrder.payment_details?.paid_at || backendOrder.paymentDetails?.paidAt,
      paymentProof: backendOrder.payment_details?.payment_proof || backendOrder.paymentDetails?.paymentProof,
    } : undefined,
    
    // Coupon information
    coupon: backendOrder.coupon ? {
      code: backendOrder.coupon.code,
      discountAmount: backendOrder.coupon.discount_amount || backendOrder.coupon.discountAmount,
      discountType: backendOrder.coupon.discount_type || backendOrder.coupon.discountType,
    } : undefined,
    
    // Notes
    notes: backendOrder.notes,
    cancelReason: backendOrder.cancel_reason || backendOrder.cancelReason,
    
    // Timestamps
    createdAt: backendOrder.created_at || backendOrder.createdAt || new Date().toISOString(),
    updatedAt: backendOrder.updated_at || backendOrder.updatedAt || new Date().toISOString(),
    paidAt: backendOrder.paid_at || backendOrder.paidAt,
    shippedAt: backendOrder.shipped_at || backendOrder.shippedAt,
    deliveredAt: backendOrder.delivered_at || backendOrder.deliveredAt,
    cancelledAt: backendOrder.cancelled_at || backendOrder.cancelledAt,
  };
}

function mapOrderItemFromBackend(backendItem: any): OrderItem {
  return {
    id: backendItem.id,
    productId: backendItem.product_id || backendItem.productId,
    product: backendItem.product, // Assuming product is already mapped
    quantity: backendItem.quantity || 0,
    pricePerKg: backendItem.price_per_kg || backendItem.pricePerKg || 0,
    totalPrice: backendItem.total_price || backendItem.totalPrice || 0,
    sellerId: backendItem.seller_id || backendItem.sellerId,
    sellerName: backendItem.seller_name || backendItem.sellerName || 'Unknown Seller',
  };
}

// Helper function to map frontend filters to backend format
function mapFiltersToBackend(filters: OrderFilters) {
  const backendFilters: Record<string, any> = {};
  
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      backendFilters.status = filters.status.join(',');
    } else {
      backendFilters.status = filters.status;
    }
  }
  
  if (filters.paymentStatus) {
    if (Array.isArray(filters.paymentStatus)) {
      backendFilters.payment_status = filters.paymentStatus.join(',');
    } else {
      backendFilters.payment_status = filters.paymentStatus;
    }
  }
  
  if (filters.paymentMethod) {
    if (Array.isArray(filters.paymentMethod)) {
      backendFilters.payment_method = filters.paymentMethod.join(',');
    } else {
      backendFilters.payment_method = filters.paymentMethod;
    }
  }
  
  if (filters.sellerId) backendFilters.seller_id = filters.sellerId;
  if (filters.dateFrom) backendFilters.date_from = filters.dateFrom;
  if (filters.dateTo) backendFilters.date_to = filters.dateTo;
  if (filters.search) backendFilters.search = filters.search;
  if (filters.sortBy) backendFilters.sort_by = filters.sortBy;
  if (filters.page) backendFilters.page = filters.page;
  if (filters.limit) backendFilters.limit = filters.limit;
  
  return backendFilters;
}

// Orders service implementation
export const ordersService = {
  // Get orders with filters
  getOrders: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    try {
      console.log('Fetching orders with filters:', filters);
      
      const backendFilters = mapFiltersToBackend(filters);
      const params = new URLSearchParams();
      
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString 
        ? `${API_ENDPOINTS.ORDERS.LIST}?${queryString}`
        : API_ENDPOINTS.ORDERS.LIST;
      
      const response = await api.get<any>(url);
      console.log('Backend orders response:', response);
      
      const mappedOrders = (response.orders || []).map(mapOrderFromBackend);
      
      return {
        orders: mappedOrders,
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: mappedOrders.length,
          itemsPerPage: filters.limit || 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        stats: response.stats,
      };
    } catch (error: any) {
      console.warn('Orders API not available:', error.message);
      
      // Return empty orders as fallback
      return {
        orders: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: filters.limit || 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  // Get order by ID
  getOrder: async (id: string): Promise<{ order: Order }> => {
    try {
      console.log('Fetching order by ID:', id);
      
      const response = await api.get<any>(`${API_ENDPOINTS.ORDERS.DETAIL}/${id}`);
      console.log('Backend order response:', response);
      
      const mappedOrder = mapOrderFromBackend(response.order || response);
      
      return { order: mappedOrder };
    } catch (error: any) {
      console.warn('Order detail API not available:', error.message);
      throw new Error('Order not found');
    }
  },

  // Get seller orders
  getSellerOrders: async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
    try {
      console.log('Fetching seller orders with filters:', filters);
      
      const backendFilters = mapFiltersToBackend(filters);
      const params = new URLSearchParams();
      
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString 
        ? `${API_ENDPOINTS.ORDERS.LIST}/seller?${queryString}`
        : `${API_ENDPOINTS.ORDERS.LIST}/seller`;
      
      const response = await api.get<any>(url);
      console.log('Backend seller orders response:', response);
      
      const mappedOrders = (response.orders || []).map(mapOrderFromBackend);
      
      return {
        orders: mappedOrders,
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: mappedOrders.length,
          itemsPerPage: filters.limit || 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        stats: response.stats,
      };
    } catch (error: any) {
      console.warn('Seller orders API not available:', error.message);
      
      // Return empty orders as fallback
      return {
        orders: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: filters.limit || 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  // Create new order
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    try {
      console.log('Creating order:', data);
      
      const backendData = {
        items: data.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          seller_id: item.sellerId,
        })),
        shipping_address: {
          full_name: data.shippingAddress.fullName,
          phone: data.shippingAddress.phone,
          address: data.shippingAddress.address,
          city: data.shippingAddress.city,
          province: data.shippingAddress.province,
          postal_code: data.shippingAddress.postalCode,
          notes: data.shippingAddress.notes,
        },
        shipping_option_id: data.shippingOptionId,
        payment_method: data.paymentMethod,
        coupon_code: data.couponCode,
        notes: data.notes,
      };
      
      const response = await api.post<any>(API_ENDPOINTS.ORDERS.CREATE, backendData);
      console.log('Backend create order response:', response);
      
      const mappedOrder = mapOrderFromBackend(response.order || response);
      
      return {
        success: response.success || true,
        order: mappedOrder,
        paymentInstructions: response.paymentInstructions || response.payment_instructions,
        message: response.message || 'Order created successfully',
      };
    } catch (error: any) {
      console.warn('Create order API not available:', error.message);
      throw new Error(error.message || 'Failed to create order');
    }
  },

  // Update order status
  updateOrderStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResponse> => {
    try {
      console.log('Updating order status:', id, data);
      
      const backendData = {
        status: data.status,
        notes: data.notes,
        tracking_number: data.trackingNumber,
      };
      
      const response = await api.put<any>(`${API_ENDPOINTS.ORDERS.UPDATE_STATUS}/${id}`, backendData);
      console.log('Backend update order status response:', response);
      
      const mappedOrder = mapOrderFromBackend(response.order || response);
      
      return {
        success: response.success || true,
        order: mappedOrder,
        message: response.message || 'Order status updated successfully',
      };
    } catch (error: any) {
      console.warn('Update order status API not available:', error.message);
      throw new Error(error.message || 'Failed to update order status');
    }
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string): Promise<UpdateOrderStatusResponse> => {
    try {
      console.log('Cancelling order:', id, reason);
      
      const backendData = {
        status: 'cancelled',
        notes: reason,
      };
      
      const response = await api.put<any>(`${API_ENDPOINTS.ORDERS.CANCEL}/${id}`, backendData);
      console.log('Backend cancel order response:', response);
      
      const mappedOrder = mapOrderFromBackend(response.order || response);
      
      return {
        success: response.success || true,
        order: mappedOrder,
        message: response.message || 'Order cancelled successfully',
      };
    } catch (error: any) {
      console.warn('Cancel order API not available:', error.message);
      throw new Error(error.message || 'Failed to cancel order');
    }
  },

  // Get order statistics
  getOrderStats: async (period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<OrderStats> => {
    try {
      console.log('Fetching order stats for period:', period);
      
      const response = await api.get<any>(`${API_ENDPOINTS.ORDERS.LIST}/stats?period=${period}`);
      console.log('Backend order stats response:', response);
      
      return {
        totalOrders: response.totalOrders || response.total_orders || 0,
        pendingOrders: response.pendingOrders || response.pending_orders || 0,
        paidOrders: response.paidOrders || response.paid_orders || 0,
        processingOrders: response.processingOrders || response.processing_orders || 0,
        shippedOrders: response.shippedOrders || response.shipped_orders || 0,
        deliveredOrders: response.deliveredOrders || response.delivered_orders || 0,
        cancelledOrders: response.cancelledOrders || response.cancelled_orders || 0,
        totalRevenue: response.totalRevenue || response.total_revenue || 0,
        averageOrderValue: response.averageOrderValue || response.average_order_value || 0,
        topProducts: response.topProducts || response.top_products || [],
        recentOrders: (response.recentOrders || response.recent_orders || []).map(mapOrderFromBackend),
      };
    } catch (error: any) {
      console.warn('Order stats API not available:', error.message);
      
      // Return empty stats as fallback
      return {
        totalOrders: 0,
        pendingOrders: 0,
        paidOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topProducts: [],
        recentOrders: [],
      };
    }
  },

  // Get order tracking
  getOrderTracking: async (id: string): Promise<OrderTracking> => {
    try {
      console.log('Fetching order tracking for:', id);
      
      const response = await api.get<any>(`${API_ENDPOINTS.ORDERS.TRACKING}/${id}`);
      console.log('Backend order tracking response:', response);
      
      return {
        orderId: response.orderId || response.order_id || id,
        orderNumber: response.orderNumber || response.order_number || `ORD-${id}`,
        status: response.status || 'pending',
        trackingNumber: response.trackingNumber || response.tracking_number,
        courierName: response.courierName || response.courier_name,
        timeline: response.timeline || [],
        estimatedDelivery: response.estimatedDelivery || response.estimated_delivery,
        actualDelivery: response.actualDelivery || response.actual_delivery,
      };
    } catch (error: any) {
      console.warn('Order tracking API not available:', error.message);
      throw new Error('Order tracking not available');
    }
  },

  // Get payment instructions
  getPaymentInstructions: async (id: string): Promise<PaymentInstructions> => {
    try {
      console.log('Fetching payment instructions for:', id);
      
      const response = await api.get<any>(`${API_ENDPOINTS.ORDERS.DETAIL}/${id}/payment`);
      console.log('Backend payment instructions response:', response);
      
      return {
        orderId: response.orderId || response.order_id || id,
        paymentMethod: response.paymentMethod || response.payment_method,
        amount: response.amount || 0,
        instructions: response.instructions || {},
        expiresAt: response.expiresAt || response.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error: any) {
      console.warn('Payment instructions API not available:', error.message);
      throw new Error('Payment instructions not available');
    }
  },
};

// Export orders service and types
export default ordersService;
export type {
  Order,
  OrderItem,
  OrderFilters,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  OrdersResponse,
  OrderStats,
  OrderTracking,
  PaymentInstructions,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
};