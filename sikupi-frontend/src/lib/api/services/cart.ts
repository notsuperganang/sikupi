// FILE PATH: /src/lib/api/services/cart.ts

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { 
  Cart, 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartResponse, 
  CartCountResponse,
  Coupon,
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  CalculateShippingRequest,
  CalculateShippingResponse
} from '@/lib/types/cart';

// Helper function to map backend cart data to frontend format
function mapCartFromBackend(backendCart: any): Cart {
  return {
    id: backendCart.id,
    userId: backendCart.user_id || backendCart.userId,
    items: (backendCart.items || []).map(mapCartItemFromBackend),
    totalItems: backendCart.total_items || backendCart.totalItems || 0,
    totalWeight: backendCart.total_weight || backendCart.totalWeight || 0,
    totalPrice: backendCart.total_price || backendCart.totalPrice || 0,
    createdAt: backendCart.created_at || backendCart.createdAt || new Date().toISOString(),
    updatedAt: backendCart.updated_at || backendCart.updatedAt || new Date().toISOString(),
  };
}

function mapCartItemFromBackend(backendItem: any): CartItem {
  return {
    id: backendItem.id,
    productId: backendItem.product_id || backendItem.productId,
    product: backendItem.product, // Assuming product is already mapped
    quantity: backendItem.quantity || 0,
    sellerId: backendItem.seller_id || backendItem.sellerId,
    sellerName: backendItem.seller_name || backendItem.sellerName || 'Unknown Seller',
    pricePerKg: backendItem.price_per_kg || backendItem.pricePerKg || 0,
    totalPrice: backendItem.total_price || backendItem.totalPrice || 0,
    addedAt: backendItem.added_at || backendItem.addedAt || new Date().toISOString(),
    updatedAt: backendItem.updated_at || backendItem.updatedAt || new Date().toISOString(),
  };
}

// Cart service implementation
export const cartService = {
  // Get current user's cart
  getCart: async (): Promise<Cart> => {
    try {
      console.log('Fetching user cart');
      
      const response = await api.get<any>(API_ENDPOINTS.CART.GET);
      console.log('Backend cart response:', response);
      
      const mappedCart = mapCartFromBackend(response.cart || response);
      
      return mappedCart;
    } catch (error: any) {
      console.warn('Cart API not available:', error.message);
      
      // Return empty cart as fallback
      return {
        id: 'temp-cart',
        userId: 'temp-user',
        items: [],
        totalItems: 0,
        totalWeight: 0,
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  // Get cart count only (for header badge)
  getCartCount: async (): Promise<CartCountResponse> => {
    try {
      console.log('Fetching cart count');
      
      const response = await api.get<any>(`${API_ENDPOINTS.CART.GET}/count`);
      console.log('Backend cart count response:', response);
      
      return {
        count: response.count || 0,
        totalItems: response.totalItems || response.total_items || 0,
      };
    } catch (error: any) {
      console.warn('Cart count API not available:', error.message);
      
      // Return zero count as fallback
      return {
        count: 0,
        totalItems: 0,
      };
    }
  },

  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    try {
      console.log('Adding item to cart:', data);
      
      const backendData = {
        product_id: data.productId,
        quantity: data.quantity,
        seller_id: data.sellerId,
      };
      
      const response = await api.post<any>(API_ENDPOINTS.CART.ADD_ITEM, backendData);
      console.log('Backend add to cart response:', response);
      
      const mappedCart = mapCartFromBackend(response.cart || response);
      
      return {
        success: response.success || true,
        cart: mappedCart,
        message: response.message || 'Item added to cart successfully',
      };
    } catch (error: any) {
      console.warn('Add to cart API not available:', error.message);
      throw new Error(error.message || 'Failed to add item to cart');
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, data: UpdateCartItemRequest): Promise<CartResponse> => {
    try {
      console.log('Updating cart item:', itemId, data);
      
      const backendData = {
        quantity: data.quantity,
      };
      
      const response = await api.put<any>(`${API_ENDPOINTS.CART.UPDATE_ITEM}/${itemId}`, backendData);
      console.log('Backend update cart item response:', response);
      
      const mappedCart = mapCartFromBackend(response.cart || response);
      
      return {
        success: response.success || true,
        cart: mappedCart,
        message: response.message || 'Cart item updated successfully',
      };
    } catch (error: any) {
      console.warn('Update cart item API not available:', error.message);
      throw new Error(error.message || 'Failed to update cart item');
    }
  },

  // Remove item from cart
  removeCartItem: async (itemId: string): Promise<CartResponse> => {
    try {
      console.log('Removing cart item:', itemId);
      
      const response = await api.delete<any>(`${API_ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`);
      console.log('Backend remove cart item response:', response);
      
      const mappedCart = mapCartFromBackend(response.cart || response);
      
      return {
        success: response.success || true,
        cart: mappedCart,
        message: response.message || 'Item removed from cart successfully',
      };
    } catch (error: any) {
      console.warn('Remove cart item API not available:', error.message);
      throw new Error(error.message || 'Failed to remove cart item');
    }
  },

  // Clear entire cart
  clearCart: async (): Promise<CartResponse> => {
    try {
      console.log('Clearing cart');
      
      const response = await api.delete<any>(API_ENDPOINTS.CART.CLEAR);
      console.log('Backend clear cart response:', response);
      
      const mappedCart = mapCartFromBackend(response.cart || response);
      
      return {
        success: response.success || true,
        cart: mappedCart,
        message: response.message || 'Cart cleared successfully',
      };
    } catch (error: any) {
      console.warn('Clear cart API not available:', error.message);
      throw new Error(error.message || 'Failed to clear cart');
    }
  },

  // Get available coupons
  getAvailableCoupons: async (): Promise<{ coupons: Coupon[] }> => {
    try {
      console.log('Fetching available coupons');
      
      const response = await api.get<any>(`${API_ENDPOINTS.CART.GET}/coupons`);
      console.log('Backend coupons response:', response);
      
      const mappedCoupons = (response.coupons || []).map((coupon: any) => ({
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discount_type || coupon.discountType,
        discountValue: coupon.discount_value || coupon.discountValue,
        minimumOrderAmount: coupon.minimum_order_amount || coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximum_discount_amount || coupon.maximumDiscountAmount,
        validFrom: coupon.valid_from || coupon.validFrom,
        validUntil: coupon.valid_until || coupon.validUntil,
        usageLimit: coupon.usage_limit || coupon.usageLimit,
        usedCount: coupon.used_count || coupon.usedCount || 0,
        isActive: coupon.is_active !== undefined ? coupon.is_active : (coupon.isActive !== undefined ? coupon.isActive : true),
      }));
      
      return { coupons: mappedCoupons };
    } catch (error: any) {
      console.warn('Coupons API not available:', error.message);
      
      // Return empty coupons as fallback
      return { coupons: [] };
    }
  },

  // Apply discount coupon
  applyDiscount: async (data: ApplyDiscountRequest): Promise<ApplyDiscountResponse> => {
    try {
      console.log('Applying discount coupon:', data);
      
      const backendData = {
        coupon_code: data.couponCode,
      };
      
      const response = await api.post<any>(`${API_ENDPOINTS.CART.GET}/apply-discount`, backendData);
      console.log('Backend apply discount response:', response);
      
      const mappedCart = mapCartFromBackend(response.cart || response);
      
      return {
        success: response.success || true,
        discount: {
          couponId: response.discount?.coupon_id || response.discount?.couponId,
          couponCode: response.discount?.coupon_code || response.discount?.couponCode,
          discountAmount: response.discount?.discount_amount || response.discount?.discountAmount,
          discountType: response.discount?.discount_type || response.discount?.discountType,
        },
        cart: mappedCart,
        message: response.message || 'Discount applied successfully',
      };
    } catch (error: any) {
      console.warn('Apply discount API not available:', error.message);
      throw new Error(error.message || 'Failed to apply discount');
    }
  },

  // Calculate shipping cost
  calculateShipping: async (data: CalculateShippingRequest): Promise<CalculateShippingResponse> => {
    try {
      console.log('Calculating shipping cost:', data);
      
      const backendData = {
        destination_city: data.destinationCity,
        destination_province: data.destinationProvince,
        weight: data.weight,
      };
      
      const response = await api.post<any>(API_ENDPOINTS.SHIPPING.RATES, backendData);
      console.log('Backend shipping calculation response:', response);
      
      const mappedShippingOptions = (response.shippingOptions || response.shipping_options || []).map((option: any) => ({
        id: option.id,
        name: option.name,
        description: option.description,
        estimatedDays: option.estimated_days || option.estimatedDays,
        price: option.price || 0,
        courierCode: option.courier_code || option.courierCode,
        serviceCode: option.service_code || option.serviceCode,
      }));
      
      return {
        success: response.success || true,
        shippingOptions: mappedShippingOptions,
        message: response.message || 'Shipping calculated successfully',
      };
    } catch (error: any) {
      console.warn('Shipping calculation API not available:', error.message);
      
      // Return default shipping options as fallback
      return {
        success: false,
        shippingOptions: [
          {
            id: 'regular',
            name: 'Regular Shipping',
            description: 'Standard delivery',
            estimatedDays: '3-5 hari',
            price: 15000,
            courierCode: 'regular',
            serviceCode: 'REG',
          },
          {
            id: 'express',
            name: 'Express Shipping',
            description: 'Fast delivery',
            estimatedDays: '1-2 hari',
            price: 25000,
            courierCode: 'express',
            serviceCode: 'EXP',
          },
        ],
        message: 'Using fallback shipping options',
      };
    }
  },
};

// Export cart service and types
export default cartService;
export type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartResponse,
  CartCountResponse,
  Coupon,
  ApplyDiscountRequest,
  ApplyDiscountResponse,
  CalculateShippingRequest,
  CalculateShippingResponse,
};