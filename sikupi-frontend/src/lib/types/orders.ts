// FILE: src/lib/types/orders.ts (Updated to fix TypeScript errors)
// Order status types
export type OrderStatus = 
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

// Payment method types
export type PaymentMethod = 
  | "bank_transfer"
  | "e_wallet"
  | "credit_card"
  | "cod";

// Payment status types
export type PaymentStatus = 
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

// Main Order interface
export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  productTitle: string;
  quantity: number;
  pricePerKg: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  shippingMethod: string;
  shippingCost: number;
  trackingNumber?: string; // Changed to optional
  notes?: string; // Changed to optional
  createdAt: string;
  updatedAt: string;
}

// Create Order Types
export interface CreateOrderRequest {
  productId: string;
  buyerId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  shippingMethod: string;
  shippingCost?: number;
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