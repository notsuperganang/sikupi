import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Types
import type { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Product, 
  Transaction, 
  CartItem, 
  Article,
  AIAssessment,
  Notification,
  PlatformMetrics,
  UserStats
} from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      // Handle different error types
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        toast.error('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else {
        // Show error message from API if available
        const message = error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(message);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Create API client instance
const api = createApiClient();

// Generic API methods
export const apiRequest = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get(url, config);
    return response.data;
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete(url, config);
    return response.data;
  },
};

// Authentication API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>('/auth/login', credentials),

  register: (userData: any) =>
    apiRequest.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>('/auth/register', userData),

  getProfile: () =>
    apiRequest.get<ApiResponse<{ user: User }>>('/auth/profile'),

  updateProfile: (userData: Partial<User>) =>
    apiRequest.put<ApiResponse<{ user: User }>>('/auth/profile', userData),

  changePassword: (passwordData: { current_password: string; new_password: string }) =>
    apiRequest.post<ApiResponse<{}>>('/auth/change-password', passwordData),

  logout: () =>
    apiRequest.post<ApiResponse<{}>>('/auth/logout'),
};

// Products API
export const productsApi = {
  getProducts: (filters?: any) =>
    apiRequest.get<PaginatedResponse<Product>>('/products', { params: filters }),

  getProduct: (id: string) =>
    apiRequest.get<ApiResponse<{ product: Product }>>(`/products/${id}`),

  createProduct: (productData: any) =>
    apiRequest.post<ApiResponse<{ product: Product }>>('/products', productData),

  updateProduct: (id: string, productData: any) =>
    apiRequest.put<ApiResponse<{ product: Product }>>(`/products/${id}`, productData),

  deleteProduct: (id: string) =>
    apiRequest.delete<ApiResponse<{}>>(`/products/${id}`),

  toggleFavorite: (id: string) =>
    apiRequest.post<ApiResponse<{ is_favorited: boolean }>>(`/products/${id}/favorite`),

  getSimilarProducts: (id: string) =>
    apiRequest.get<ApiResponse<{ similar_products: Product[] }>>(`/products/${id}/similar`),

  uploadImages: (id: string, formData: FormData) =>
    apiRequest.post<ApiResponse<{ images: any[] }>>(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Transactions API
export const transactionsApi = {
  getTransactions: (filters?: any) =>
    apiRequest.get<PaginatedResponse<Transaction>>('/transactions', { params: filters }),

  getTransaction: (id: string) =>
    apiRequest.get<ApiResponse<{ transaction: Transaction }>>(`/transactions/${id}`),

  createTransaction: (transactionData: any) =>
    apiRequest.post<ApiResponse<{ transaction: Transaction }>>('/transactions', transactionData),

  updateTransactionStatus: (id: string, statusData: any) =>
    apiRequest.put<ApiResponse<{ transaction: Transaction }>>(`/transactions/${id}/status`, statusData),

  cancelTransaction: (id: string, reason?: string) =>
    apiRequest.post<ApiResponse<{ transaction: Transaction }>>(`/transactions/${id}/cancel`, { reason }),

  getTransactionStats: () =>
    apiRequest.get<ApiResponse<{ stats: any }>>('/transactions/stats/summary'),
};

// Cart API
export const cartApi = {
  getCart: () =>
    apiRequest.get<ApiResponse<{ cart: { items: CartItem[]; summary: any } }>>('/cart'),

  addToCart: (itemData: { product_id: string; quantity_kg: number }) =>
    apiRequest.post<ApiResponse<{ item: CartItem }>>('/cart/items', itemData),

  updateCartItem: (id: string, itemData: { quantity_kg: number }) =>
    apiRequest.put<ApiResponse<{ item: CartItem }>>(`/cart/items/${id}`, itemData),

  removeFromCart: (id: string) =>
    apiRequest.delete<ApiResponse<{}>>(`/cart/items/${id}`),

  clearCart: () =>
    apiRequest.delete<ApiResponse<{}>>('/cart'),

  getCartCount: () =>
    apiRequest.get<ApiResponse<{ count: number }>>('/cart/count'),
};

// AI Assessment API
export const aiApi = {
  assessImage: (assessmentData: { image_url: string; product_id?: string; image_context?: string }) =>
    apiRequest.post<ApiResponse<{ assessment: AIAssessment }>>('/ai/assess', assessmentData),

  batchAssess: (assessmentData: { images: string[]; product_id?: string }) =>
    apiRequest.post<ApiResponse<{ results: AIAssessment[]; summary: any }>>('/ai/assess-batch', assessmentData),

  getAssessments: (filters?: any) =>
    apiRequest.get<PaginatedResponse<AIAssessment>>('/ai/assessments', { params: filters }),

  getAssessment: (id: string) =>
    apiRequest.get<ApiResponse<{ assessment: AIAssessment }>>(`/ai/assessments/${id}`),

  getAssessmentStats: () =>
    apiRequest.get<ApiResponse<{ stats: any }>>('/ai/stats'),
};

// Articles API
export const articlesApi = {
  getArticles: (filters?: any) =>
    apiRequest.get<PaginatedResponse<Article>>('/articles', { params: filters }),

  getArticle: (slug: string) =>
    apiRequest.get<ApiResponse<{ article: Article }>>(`/articles/${slug}`),

  getRelatedArticles: (slug: string, limit?: number) =>
    apiRequest.get<ApiResponse<{ related_articles: Article[] }>>(`/articles/${slug}/related`, { params: { limit } }),

  getCategories: () =>
    apiRequest.get<ApiResponse<{ categories: { name: string; count: number }[] }>>('/articles/meta/categories'),
};

// Dashboard API
export const dashboardApi = {
  getPlatformMetrics: () =>
    apiRequest.get<ApiResponse<{ metrics: PlatformMetrics; last_updated: string }>>('/dashboard/metrics'),

  getUserStats: () =>
    apiRequest.get<ApiResponse<{ stats: UserStats }>>('/dashboard/user-stats'),

  getWasteDistribution: () =>
    apiRequest.get<ApiResponse<{ distribution: any; total_quantity: number }>>('/dashboard/waste-distribution'),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (filters?: any) =>
    apiRequest.get<PaginatedResponse<Notification>>('/notifications', { params: filters }),

  markAsRead: (id: string) =>
    apiRequest.put<ApiResponse<{ notification: Notification }>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiRequest.put<ApiResponse<{}>>('/notifications/read-all'),

  deleteNotification: (id: string) =>
    apiRequest.delete<ApiResponse<{}>>(`/notifications/${id}`),

  getNotificationCount: () =>
    apiRequest.get<ApiResponse<{ total: number; unread: number }>>('/notifications/count'),
};

// Uploads API
export const uploadsApi = {
  uploadImage: (formData: FormData) =>
    apiRequest.post<ApiResponse<{ image: { url: string; fileName: string } }>>('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadImages: (formData: FormData) =>
    apiRequest.post<ApiResponse<{ images: { url: string; fileName: string }[] }>>('/uploads/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadProfileImage: (formData: FormData) =>
    apiRequest.post<ApiResponse<{ image: { url: string; fileName: string } }>>('/uploads/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteImage: (fileName: string) =>
    apiRequest.delete<ApiResponse<{}>>('/uploads/image', { data: { fileName } }),
};

// Chatbot API
export const chatbotApi = {
  sendMessage: (message: string) =>
    apiRequest.post<any>('/chatbot/message', { message }),

  getHistory: () =>
    apiRequest.get<any>('/chatbot/history'),

  clearHistory: () =>
    apiRequest.delete<any>('/chatbot/history'),

  healthCheck: () =>
    apiRequest.get<any>('/chatbot/health'),
};

// Payments API
export const paymentsApi = {
  getToken: (transaction_id: string) =>
    apiRequest.post<ApiResponse<{ token: string; redirect_url: string }>>('/payments/midtrans/token', { transaction_id }),

  getMethods: () =>
    apiRequest.get<ApiResponse<{ methods: any[] }>>('/payments/methods'),
};

// Shipping API
export const shippingApi = {
  getRates: (rateData: any) =>
    apiRequest.post<ApiResponse<{ rates: any[]; origin: any; destination: any }>>('/shipping/rates', rateData),

  getAreas: (search?: string) =>
    apiRequest.get<ApiResponse<{ areas: any[] }>>('/shipping/areas', { params: { search } }),

  trackShipment: (tracking_number: string) =>
    apiRequest.get<ApiResponse<{ tracking_number: string; status: string; history: any[] }>>(`/shipping/track/${tracking_number}`),
};

// Export the main API client for custom requests
export { api };
export default apiRequest;