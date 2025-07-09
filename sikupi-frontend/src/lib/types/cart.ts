// FILE: src/lib/types/cart.ts
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  pricePerKg: number;
  totalPrice: number;
  product?: any; // Product details
  createdAt: string;
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
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyDiscountRequest {
  couponCode: string;
}

export interface CalculateShippingRequest {
  destination: {
    city: string;
    postalCode: string;
  };
}

export interface CartResponse {
  cart: Cart;
  message?: string;
}

export interface CartItemResponse {
  item: CartItem;
  cart: Cart;
  message?: string;
}