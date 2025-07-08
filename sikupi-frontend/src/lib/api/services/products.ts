import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  grade: 'A' | 'B' | 'C';
  weight: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating?: number;
  location: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  viewCount: number;
  soldCount: number;
  aiAssessment?: {
    quality: string;
    grade: string;
    confidence: number;
    assessment: string;
  };
}

export interface ProductFilters {
  category?: string;
  grade?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  sortBy?: 'price_low' | 'price_high' | 'newest' | 'oldest' | 'popular';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    categories: Array<{ id: string; label: string; count: number }>;
    grades: Array<{ grade: string; count: number }>;
    priceRange: { min: number; max: number };
    locations: Array<{ location: string; count: number }>;
  };
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  weight: number;
  images: File[];
  location: string;
}

export interface CreateProductResponse {
  product: Product;
  message: string;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  weight?: number;
  location?: string;
  isActive?: boolean;
}

export interface UpdateProductResponse {
  product: Product;
  message: string;
}

export const productsService = {
  // Get all products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}` : API_ENDPOINTS.PRODUCTS.LIST;
    
    return api.get<ProductsResponse>(url);
  },

  // Get product by ID
  getProduct: async (id: string): Promise<{ product: Product }> => {
    return api.get<{ product: Product }>(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`);
  },

  // Search products
  searchProducts: async (query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get<ProductsResponse>(`${API_ENDPOINTS.PRODUCTS.SEARCH}?${params.toString()}`);
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<{ products: Product[] }> => {
    return api.get<{ products: Product[] }>(`/api/products/featured?limit=${limit}`);
  },

  // Get products by seller
  getSellerProducts: async (sellerId: string, filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString 
      ? `/api/products/seller/${sellerId}?${queryString}`
      : `/api/products/seller/${sellerId}`;
    
    return api.get<ProductsResponse>(url);
  },

  // Get my products (for authenticated seller)
  getMyProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString 
      ? `/api/products/my?${queryString}`
      : `/api/products/my`;
    
    return api.get<ProductsResponse>(url);
  },

  // Create new product
  createProduct: async (data: CreateProductRequest): Promise<CreateProductResponse> => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('category', data.category);
    formData.append('weight', data.weight.toString());
    formData.append('location', data.location);
    
    // Append images
    data.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    return api.post<CreateProductResponse>(API_ENDPOINTS.PRODUCTS.LIST, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update product
  updateProduct: async (id: string, data: UpdateProductRequest): Promise<UpdateProductResponse> => {
    return api.put<UpdateProductResponse>(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`, data);
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`);
  },

  // Update product images
  updateProductImages: async (id: string, images: File[]): Promise<{ images: string[]; message: string }> => {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    return api.put<{ images: string[]; message: string }>(
      `/api/products/${id}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Get product categories
  getCategories: async (): Promise<{ categories: Array<{ id: string; label: string; count: number }> }> => {
    return api.get<{ categories: Array<{ id: string; label: string; count: number }> }>('/api/products/categories');
  },

  // Get product statistics
  getProductStats: async (id: string): Promise<{
    viewCount: number;
    soldCount: number;
    revenue: number;
    rating: number;
    reviewCount: number;
  }> => {
    return api.get<{
      viewCount: number;
      soldCount: number;
      revenue: number;
      rating: number;
      reviewCount: number;
    }>(`/api/products/${id}/stats`);
  },

  // Toggle product status
  toggleProductStatus: async (id: string): Promise<{ product: Product; message: string }> => {
    return api.patch<{ product: Product; message: string }>(`/api/products/${id}/toggle-status`);
  },

  // Get recommended products
  getRecommendedProducts: async (productId?: string, limit: number = 6): Promise<{ products: Product[] }> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (productId) {
      params.append('productId', productId);
    }

    return api.get<{ products: Product[] }>(`/api/products/recommended?${params.toString()}`);
  },
};