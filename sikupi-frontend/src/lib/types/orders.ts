// FILE PATH: /src/lib/types/orders.ts

import { Product } from './product';
import { ShippingAddress, ShippingOption } from './cart';

// Order Status Types
export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'cancelled';

export type PaymentMethod = 
  | 'bank_transfer' 
  | 'credit_card' 
  | 'e_wallet' 
  | 'cash_on_delivery';

// Order Item Types
export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  pricePerKg: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  
  // Order items
  items: OrderItem[];
  totalItems: number;
  totalWeight: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  
  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  
  // Shipping information
  shippingAddress: ShippingAddress;
  shippingOption: ShippingOption;
  trackingNumber?: string;
  
  // Payment information
  paymentDetails?: {
    method: PaymentMethod;
    transactionId?: string;
    paidAt?: string;
    paymentProof?: string;
  };
  
  // Coupon information
  coupon?: {
    code: string;
    discountAmount: number;
    discountType: string;
  };
  
  // Notes
  notes?: string;
  cancelReason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

// Order Filters
export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod | PaymentMethod[];
  sellerId?: string; // for seller filtering their orders
  dateFrom?: string;
  dateTo?: string;
  search?: string; // search by order number, customer name, etc
  sortBy?: 'newest' | 'oldest' | 'amount_high' | 'amount_low';
  page?: number;
  limit?: number;
}

// Create Order Types
export interface CreateOrderRequest {
  // Items from cart
  items: Array<{
    productId: string;
    quantity: number;
    sellerId: string;
  }>;
  
  // Shipping
  shippingAddress: ShippingAddress;
  shippingOptionId: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  
  // Optional
  couponCode?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  paymentInstructions?: {
    method: PaymentMethod;
    amount: number;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    paymentToken?: string; // for e-wallet/credit card
    expiresAt: string;
  };
  message: string;
}

// Update Order Types
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  order: Order;
  message: string;
}

// Order Statistics
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productTitle: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  recentOrders: Order[];
}

// Orders Response
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
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
}

// Order Tracking
export interface OrderTracking {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  timeline: Array<{
    status: string;
    description: string;
    timestamp: string;
    location?: string;
  }>;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

// Payment Instructions
export interface PaymentInstructions {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  instructions: {
    bankTransfer?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      transferAmount: number;
      uniqueCode?: number;
    };
    eWallet?: {
      provider: string;
      qrCode?: string;
      deepLink?: string;
      accountNumber?: string;
    };
    creditCard?: {
      paymentToken: string;
      redirectUrl: string;
    };
  };
  expiresAt: string;
}