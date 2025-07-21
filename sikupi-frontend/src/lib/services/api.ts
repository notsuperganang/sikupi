// FILE: sikupi-frontend/src/lib/services/api.ts
// GANTI seluruh file dengan kode berikut untuk fix TypeScript errors:

import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User 
} from "@/lib/types/auth";
import type { 
  Product, 
  ProductFilters, 
  ProductsResponse 
} from "@/lib/types/product";

// Base API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor untuk menambahkan auth token
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage atau Zustand store
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("sikupi_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor untuk handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("sikupi_token");
          localStorage.removeItem("sikupi_refresh_token");
        }
        // Redirect to login atau trigger logout action
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// ========================================
// AUTH SERVICE
// ========================================
export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
      const { data } = response;

      // Store tokens in localStorage
      if (typeof window !== "undefined" && data.success && data.token) {
        localStorage.setItem("sikupi_token", data.token);
        localStorage.setItem("sikupi_refresh_token", data.refreshToken || "");
      }

      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Login gagal";
      throw new Error(message);
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>("/auth/register", userData);
      const { data } = response;

      // Store tokens in localStorage
      if (typeof window !== "undefined" && data.success && data.token) {
        localStorage.setItem("sikupi_token", data.token);
        localStorage.setItem("sikupi_refresh_token", data.refreshToken || "");
      }

      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Registrasi gagal";
      throw new Error(message);
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: User; success: boolean }> => {
    try {
      const response = await apiClient.get<{ user: User; success: boolean }>("/auth/profile");
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengambil profil";
      throw new Error(message);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<{ user: User; success: boolean; message: string }> => {
    try {
      const response = await apiClient.put<{ user: User; success: boolean; message: string }>("/auth/profile", userData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengupdate profil";
      throw new Error(message);
    }
  },

  /**
   * Change password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.put<{ success: boolean; message: string }>("/auth/password", {
        current_password: data.currentPassword,
        new_password: data.newPassword
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengubah password";
      throw new Error(message);
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Even if API call fails, we still want to clear local storage
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("sikupi_token");
        localStorage.removeItem("sikupi_refresh_token");
      }
    }
  },

  /**
   * Refresh token
   */
  refreshToken: async (): Promise<{ token: string; success: boolean }> => {
    try {
      const refreshToken = typeof window !== "undefined" 
        ? localStorage.getItem("sikupi_refresh_token") 
        : null;
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.post<{ token: string; success: boolean }>("/auth/refresh", {
        refreshToken
      });

      // Update stored token
      if (typeof window !== "undefined" && response.data.success) {
        localStorage.setItem("sikupi_token", response.data.token);
      }

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal refresh token";
      throw new Error(message);
    }
  }
};

// ========================================
// PRODUCTS SERVICE  
// ========================================
export const productsService = {
  /**
   * Get products with filters and pagination
   */
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    try {
      const params = new URLSearchParams();
      
      // Add filters to params - FIXED: menggunakan field yang benar
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.wasteType) params.append("wasteType", filters.wasteType);
      if (filters.grade) params.append("qualityGrade", filters.grade); // mapping grade -> qualityGrade
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
      if (filters.location) params.append("city", filters.location); // mapping location -> city
      if (filters.organicCertified !== undefined) params.append("organicCertified", filters.organicCertified.toString());
      if (filters.fairTradeCertified !== undefined) params.append("fairTradeCertified", filters.fairTradeCertified.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      // order parameter tidak digunakan karena sortBy sudah include direction

      const response = await apiClient.get<{
        success: boolean;
        products: Product[];
        pagination: {
          currentPage: number;
          totalPages: number;
          pageSize: number;
          totalItems: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      }>(`/products?${params.toString()}`);

      // FIXED: Include filters object yang diperlukan
      return {
        products: response.data.products,
        pagination: {
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          itemsPerPage: response.data.pagination.pageSize,
          hasNextPage: response.data.pagination.hasNextPage,
          hasPreviousPage: response.data.pagination.hasPrevPage,
        },
        filters: {
          wasteTypes: [
            { type: "coffee_grounds", count: 0, label: "Ampas Kopi" },
            { type: "coffee_pulp", count: 0, label: "Pulp Kopi" },
            { type: "coffee_husks", count: 0, label: "Kulit Kopi" },
            { type: "coffee_chaff", count: 0, label: "Chaff Kopi" }
          ],
          qualityGrades: [
            { grade: "A", count: 0, label: "Grade A" },
            { grade: "B", count: 0, label: "Grade B" },
            { grade: "C", count: 0, label: "Grade C" }
          ],
          categories: [
            { category: "pupuk", count: 0, label: "Pupuk" },
            { category: "kompos", count: 0, label: "Kompos" },
            { category: "kerajinan", count: 0, label: "Kerajinan" }
          ],
          priceRange: { min: 0, max: 100000 },
          locations: []
        }
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengambil produk";
      throw new Error(message);
    }
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: string): Promise<{ product: Product; success: boolean }> => {
    try {
      const response = await apiClient.get<{ product: Product; success: boolean }>(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengambil detail produk";
      throw new Error(message);
    }
  },

  /**
   * Search products
   */
  searchProducts: async (
    query: string, 
    filters: Omit<ProductFilters, "search"> = {}
  ): Promise<ProductsResponse> => {
    try {
      return await productsService.getProducts({
        ...filters,
        search: query
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mencari produk";
      throw new Error(message);
    }
  },

  /**
   * Get featured products - FIXED VERSION
   */
  getFeaturedProducts: async (limit: number = 8): Promise<ProductsResponse> => {
    try {
      // PERBAIKAN: Return ProductsResponse, bukan Product[]
      const response = await productsService.getProducts({
        limit,
        sortBy: "popular"
      });
      return response; // Return full response untuk konsistensi
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengambil produk unggulan";
      throw new Error(message);
    }
  },

  /**
   * Get recommended products  
   */
  getRecommendedProducts: async (productId?: string, limit: number = 6): Promise<Product[]> => {
    try {
      // For now, just return similar products (same category or random)
      // In production, you might have a dedicated recommendation endpoint
      const response = await productsService.getProducts({
        limit: limit + 2, // Get a few extra in case one is the current product
        sortBy: "rating"
      });
      
      // Filter out the current product if provided
      let filteredProducts = response.products;
      if (productId) {
        filteredProducts = filteredProducts.filter(p => p.id !== productId);
      }
      
      return filteredProducts.slice(0, limit);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengambil rekomendasi produk";
      throw new Error(message);
    }
  },

  /**
   * Get product categories/waste types
   */
  getCategories: async () => {
    try {
      // Return categories dengan format yang expected oleh components
      return {
        wasteTypes: [
          { type: "coffee_grounds", label: "Ampas Kopi", count: 0 }, // FIXED: value -> type
          { type: "coffee_pulp", label: "Pulp Kopi", count: 0 },
          { type: "coffee_husks", label: "Kulit Kopi", count: 0 },
          { type: "coffee_chaff", label: "Chaff Kopi", count: 0 }
        ],
        qualityGrades: [
          { grade: "A", label: "Grade A", count: 0 },
          { grade: "B", label: "Grade B", count: 0 },
          { grade: "C", label: "Grade C", count: 0 }
        ]
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Gagal mengambil kategori";
      throw new Error(message);
    }
  }
};

// ========================================
// HEALTH CHECK
// ========================================
export const healthService = {
  /**
   * Check if backend is healthy
   */
  checkHealth: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await apiClient.get<{ status: string; timestamp: string }>("/health");
      return response.data;
    } catch (error: any) {
      throw new Error("Backend tidak dapat diakses");
    }
  }
};

// Export default client for custom requests
export { apiClient };
export default { auth: authService, products: productsService, health: healthService };