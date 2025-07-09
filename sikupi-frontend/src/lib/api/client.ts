// FILE PATH: /sikupi-frontend/src/lib/api/client.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';

// Types for API responses
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const TokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try to get from localStorage first
    const stored = localStorage.getItem('sikupi-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.state?.token || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('sikupi-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.state?.refreshToken || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('sikupi-auth');
    localStorage.removeItem('sikupi_remember_me');
  }
};

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration for debugging
    const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime() || 0;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          // Attempt to refresh token
          const refreshResponse = await axios.post(`${API_ENDPOINTS.BASE_URL}/api/auth/refresh`, {
            refreshToken
          });
          
          const { token, refreshToken: newRefreshToken } = refreshResponse.data;
          
          // Update stored tokens
          const storedAuth = localStorage.getItem('sikupi-auth');
          if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            parsed.state.token = token;
            parsed.state.refreshToken = newRefreshToken || refreshToken;
            localStorage.setItem('sikupi-auth', JSON.stringify(parsed));
          }
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          TokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/masuk';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/masuk';
        }
      }
    }
    
    // Handle other common HTTP errors
    const errorMessage = getErrorMessage(error);
    
    // Only show toast for non-401 errors (401 is handled above)
    if (error.response?.status !== 401) {
      toast.error('Request Failed', {
        description: errorMessage,
      });
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: error.code,
    } as ApiError);
  }
);

// Helper function to extract error messages
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.message || data.error || 'An error occurred';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection.';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  
  return error.message || 'An unexpected error occurred';
}

// Generic API request function with type safety
export async function apiRequest<T = any>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
}

// Convenience methods for common HTTP operations
export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ method: 'GET', url, ...config });
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ method: 'POST', url, data, ...config });
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ method: 'PUT', url, data, ...config });
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ method: 'PATCH', url, data, ...config });
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>({ method: 'DELETE', url, ...config });
  },
};

// File upload functions
export async function uploadFile(file: File, endpoint: string = '/api/uploads/image'): Promise<{
  url: string;
  filename: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000, // Longer timeout for file uploads
  });

  return response.data;
}

export async function uploadFiles(files: File[], endpoint: string = '/api/uploads/images'): Promise<{
  urls: string[];
  filenames: string[];
}> {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // Even longer timeout for multiple files
  });

  return response.data;
}

// Health check function
export async function checkApiHealth(): Promise<boolean> {
  try {
    await api.get('/api/health');
    return true;
  } catch {
    return false;
  }
}

// Export the configured axios instance for advanced usage
export { apiClient };

// Export default
export default api;