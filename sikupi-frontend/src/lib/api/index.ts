// FILE PATH: /src/lib/api/index.ts

// Export API client
export { api, type ApiResponse, type ApiError } from './client';

// Export services
export { authService } from './services/auth';
export { productsService } from './services/products';
export { cartService } from './services/cart';
export { ordersService } from './services/orders';
export { dashboardService } from './services/dashboard';

// Export all types
// Auth types
export type {
  User,
  UserProfile,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './services/auth';

// Product types
export type {
  Product,
  ProductFilters,
  ProductSort,
  ProductsResponse,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  UploadImagesRequest,
  UploadImagesResponse,
} from '../types/product';

// Cart types
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
  ShippingAddress,
  ShippingOption,
  CalculateShippingRequest,
  CalculateShippingResponse,
} from '../types/cart';

// Orders types
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
} from '../types/orders';

// Dashboard types
export type {
  DashboardMetrics,
  RecentActivity,
} from './services/dashboard';

// Re-export utility functions
export {
  mapProductFromBackend,
  mapProductToBackend,
  mapFiltersToBackend,
} from '../types/product';