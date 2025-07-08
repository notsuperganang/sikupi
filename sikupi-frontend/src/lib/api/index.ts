// Export API client
export { api, apiRequest, uploadFile, uploadFiles } from './client';

// Export all services
export * from './services/auth';
export * from './services/products';
export * from './services/cart';
export * from './services/orders';
export * from './services/dashboard';

// Export services as named exports for convenience
export { authService } from './services/auth';
export { productsService } from './services/products';
export { cartService } from './services/cart';
export { ordersService } from './services/orders';
export { dashboardService } from './services/dashboard';