// FILE PATH: /src/lib/types/cart.ts

import { Product } from './product';

// Cart Item Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  sellerId: string;
  sellerName: string;
  pricePerKg: number;
  totalPrice: number;
  addedAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalWeight: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  sellerId: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  message: string;
}

export interface CartCountResponse {
  count: number;
  totalItems: number;
}

// Coupon and Discount Types
export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface ApplyDiscountRequest {
  couponCode: string;
}

export interface ApplyDiscountResponse {
  success: boolean;
  discount: {
    couponId: string;
    couponCode: string;
    discountAmount: number;
    discountType: string;
  };
  cart: Cart;
  message: string;
}

// Shipping Types
export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
  courierCode: string;
  serviceCode: string;
}

export interface CalculateShippingRequest {
  destinationCity: string;
  destinationProvince: string;
  weight: number; // in kg
}

export interface CalculateShippingResponse {
  success: boolean;
  shippingOptions: ShippingOption[];
  message: string;
}