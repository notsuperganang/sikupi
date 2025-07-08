import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
  weight: number;
  image: string;
  sellerId: string;
  sellerName: string;
  grade: 'A' | 'B' | 'C';
  category: string;
  location: string;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  totalItems: number;
  totalWeight: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface AddToCartResponse {
  item: CartItem;
  summary: CartSummary;
  message: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemResponse {
  item: CartItem;
  summary: CartSummary;
  message: string;
}

export interface RemoveFromCartResponse {
  summary: CartSummary;
  message: string;
}

export interface ApplyDiscountRequest {
  code: string;
}

export interface ApplyDiscountResponse {
  discount: {
    code: string;
    amount: number;
    type: 'fixed' | 'percentage';
    description: string;
  };
  summary: CartSummary;
  message: string;
}

export interface CalculateShippingRequest {
  destination: {
    city: string;
    province: string;
    postalCode: string;
  };
}

export interface CalculateShippingResponse {
  shippingOptions: Array<{
    id: string;
    service: string;
    description: string;
    cost: number;
    estimatedDays: string;
    courier: string;
  }>;
  message: string;
}

export const cartService = {
  // Get cart items
  getCart: async (): Promise<CartResponse> => {
    return api.get<CartResponse>(API_ENDPOINTS.CART.GET);
  },

  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<AddToCartResponse> => {
    return api.post<AddToCartResponse>(API_ENDPOINTS.CART.ADD, data);
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, data: UpdateCartItemRequest): Promise<UpdateCartItemResponse> => {
    return api.put<UpdateCartItemResponse>(`${API_ENDPOINTS.CART.UPDATE}/${itemId}`, data);
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<RemoveFromCartResponse> => {
    return api.delete<RemoveFromCartResponse>(`${API_ENDPOINTS.CART.REMOVE}/${itemId}`);
  },

  // Clear entire cart
  clearCart: async (): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(API_ENDPOINTS.CART.CLEAR);
  },

  // Apply discount code
  applyDiscount: async (data: ApplyDiscountRequest): Promise<ApplyDiscountResponse> => {
    return api.post<ApplyDiscountResponse>('/api/cart/discount', data);
  },

  // Remove discount
  removeDiscount: async (): Promise<{ summary: CartSummary; message: string }> => {
    return api.delete<{ summary: CartSummary; message: string }>('/api/cart/discount');
  },

  // Calculate shipping cost
  calculateShipping: async (data: CalculateShippingRequest): Promise<CalculateShippingResponse> => {
    return api.post<CalculateShippingResponse>('/api/cart/shipping', data);
  },

  // Get cart count (for header badge)
  getCartCount: async (): Promise<{ count: number }> => {
    return api.get<{ count: number }>('/api/cart/count');
  },

  // Sync guest cart with user cart (after login)
  syncGuestCart: async (guestItems: Array<{ productId: string; quantity: number }>): Promise<CartResponse> => {
    return api.post<CartResponse>('/api/cart/sync', { items: guestItems });
  },

  // Validate cart items (check stock, prices, etc.)
  validateCart: async (): Promise<{
    valid: boolean;
    issues: Array<{
      itemId: string;
      productId: string;
      title: string;
      issue: 'out_of_stock' | 'price_changed' | 'product_inactive' | 'insufficient_stock';
      message: string;
      currentStock?: number;
      currentPrice?: number;
    }>;
    summary: CartSummary;
  }> => {
    return api.post<{
      valid: boolean;
      issues: Array<{
        itemId: string;
        productId: string;
        title: string;
        issue: 'out_of_stock' | 'price_changed' | 'product_inactive' | 'insufficient_stock';
        message: string;
        currentStock?: number;
        currentPrice?: number;
      }>;
      summary: CartSummary;
    }>('/api/cart/validate');
  },

  // Get available coupons for current cart
  getAvailableCoupons: async (): Promise<{
    coupons: Array<{
      code: string;
      description: string;
      discount: number;
      type: 'fixed' | 'percentage';
      minAmount: number;
      maxDiscount?: number;
      validUntil: string;
    }>;
  }> => {
    return api.get<{
      coupons: Array<{
        code: string;
        description: string;
        discount: number;
        type: 'fixed' | 'percentage';
        minAmount: number;
        maxDiscount?: number;
        validUntil: string;
      }>;
    }>('/api/cart/coupons');
  },
};