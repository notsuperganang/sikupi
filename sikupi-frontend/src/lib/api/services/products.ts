// FILE PATH: /src/lib/api/services/products.ts

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { 
  Product, 
  ProductFilters, 
  ProductsResponse, 
  CreateProductRequest, 
  CreateProductResponse,
  UpdateProductRequest, 
  UpdateProductResponse,
  UploadImagesRequest,
  UploadImagesResponse,
  mapProductFromBackend,
  mapProductToBackend,
  mapFiltersToBackend
} from '@/lib/types/product';

// Products service implementation
export const productsService = {
  // Get products with filters and pagination
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    try {
      console.log('Fetching products with filters:', filters);
      
      const backendFilters = mapFiltersToBackend(filters);
      const params = new URLSearchParams();
      
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString 
        ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
        : API_ENDPOINTS.PRODUCTS.LIST;
      
      const response = await api.get<any>(url);
      console.log('Backend products response:', response);
      
      const mappedProducts = (response.products || []).map(mapProductFromBackend);
      
      return {
        products: mappedProducts,
        pagination: response.pagination || {
          currentPage: filters.page || 1,
          totalPages: Math.ceil((response.total || mappedProducts.length) / (filters.limit || 12)),
          totalItems: response.total || mappedProducts.length,
          itemsPerPage: filters.limit || 12,
          hasNextPage: (filters.page || 1) < Math.ceil((response.total || mappedProducts.length) / (filters.limit || 12)),
          hasPreviousPage: (filters.page || 1) > 1,
        },
        filters: response.filters || {
          wasteTypes: [],
          qualityGrades: [],
          categories: [],
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    } catch (error: any) {
      console.warn('Products API not available:', error.message);
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: filters.limit || 12,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {
          wasteTypes: [],
          qualityGrades: [],
          categories: [],
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    }
  },

  // Get product by ID
  getProduct: async (id: string): Promise<{ product: Product }> => {
    try {
      console.log('Fetching product by ID:', id);
      
      const response = await api.get<any>(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`);
      console.log('Backend product response:', response);
      
      const mappedProduct = mapProductFromBackend(response.product || response);
      
      return { product: mappedProduct };
    } catch (error: any) {
      console.warn('Product detail API not available:', error.message);
      throw new Error('Product not found');
    }
  },

  // Search products
  searchProducts: async (query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductsResponse> => {
    try {
      console.log('Searching products:', query, filters);
      
      const searchFilters = { ...filters, search: query };
      return await productsService.getProducts(searchFilters);
    } catch (error: any) {
      console.warn('Product search API not available:', error.message);
      return productsService.getProducts(filters);
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<{ products: Product[] }> => {
    try {
      console.log('Fetching featured products, limit:', limit);
      
      const response = await api.get<any>(`${API_ENDPOINTS.PRODUCTS.FEATURED}?limit=${limit}`);
      console.log('Backend featured products response:', response);
      
      const mappedProducts = (response.products || []).map(mapProductFromBackend);
      
      return { products: mappedProducts };
    } catch (error: any) {
      console.warn('Featured products API not available:', error.message);
      
      // Fallback to regular products
      const fallbackResponse = await productsService.getProducts({ limit, sortBy: 'popular' });
      return { products: fallbackResponse.products };
    }
  },

  // Get recommended products
  getRecommendedProducts: async (productId?: string, limit: number = 6): Promise<{ products: Product[] }> => {
    try {
      console.log('Fetching recommended products:', productId, limit);
      
      const url = productId 
        ? `/api/products/${productId}/recommended?limit=${limit}`
        : `/api/products/recommended?limit=${limit}`;
      
      const response = await api.get<any>(url);
      console.log('Backend recommended products response:', response);
      
      const mappedProducts = (response.products || []).map(mapProductFromBackend);
      
      return { products: mappedProducts };
    } catch (error: any) {
      console.warn('Recommended products API not available:', error.message);
      
      // Fallback to random products
      const fallbackResponse = await productsService.getProducts({ limit, sortBy: 'newest' });
      return { products: fallbackResponse.products };
    }
  },

  // Get product categories with counts
  getCategories: async (): Promise<{ wasteTypes: Array<{ type: string; count: number; label?: string }> }> => {
    try {
      console.log('Fetching product categories');
      
      const response = await api.get<any>(`${API_ENDPOINTS.PRODUCTS.LIST}/categories`);
      console.log('Backend categories response:', response);
      
      return {
        wasteTypes: response.wasteTypes || response.categories || [],
      };
    } catch (error: any) {
      console.warn('Categories API not available:', error.message);
      
      // Return default categories
      return {
        wasteTypes: [
          { type: 'coffee_grounds', count: 0, label: 'Ampas Kopi' },
          { type: 'coffee_pulp', count: 0, label: 'Pulp Kopi' },
          { type: 'coffee_husks', count: 0, label: 'Sekam Kopi' },
          { type: 'coffee_chaff', count: 0, label: 'Chaff Kopi' },
        ],
      };
    }
  },

  // Get seller's products
  getSellerProducts: async (sellerId: string, filters: ProductFilters = {}): Promise<ProductsResponse> => {
    try {
      console.log('Fetching seller products:', sellerId, filters);
      
      const backendFilters = mapFiltersToBackend(filters);
      const params = new URLSearchParams();
      
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString 
        ? `${API_ENDPOINTS.PRODUCTS.SELLER_PRODUCTS}/${sellerId}?${queryString}`
        : `${API_ENDPOINTS.PRODUCTS.SELLER_PRODUCTS}/${sellerId}`;
      
      const response = await api.get<any>(url);
      const mappedProducts = (response.products || []).map(mapProductFromBackend);
      
      return {
        products: mappedProducts,
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: mappedProducts.length,
          itemsPerPage: filters.limit || 12,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: response.filters || {
          wasteTypes: [],
          qualityGrades: [],
          categories: [],
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    } catch (error: any) {
      console.warn('Seller products API not available:', error.message);
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: filters.limit || 12,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {
          wasteTypes: [],
          qualityGrades: [],
          categories: [],
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    }
  },

  // Get current user's products (for sellers)
  getMyProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    try {
      console.log('Fetching my products with filters:', filters);
      
      const backendFilters = mapFiltersToBackend(filters);
      const params = new URLSearchParams();
      
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString 
        ? `${API_ENDPOINTS.PRODUCTS.MY_PRODUCTS}?${queryString}`
        : API_ENDPOINTS.PRODUCTS.MY_PRODUCTS;
      
      const response = await api.get<any>(url);
      const mappedProducts = (response.products || []).map(mapProductFromBackend);
      
      return {
        products: mappedProducts,
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: mappedProducts.length,
          itemsPerPage: filters.limit || 12,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: response.filters || {
          wasteTypes: [],
          qualityGrades: [],
          categories: [],
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    } catch (error: any) {
      console.warn('My products API not available:', error.message);
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: filters.limit || 12,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {
          wasteTypes: [],
          qualityGrades: [],
          categories: [],
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    }
  },

  // Create new product
  createProduct: async (data: CreateProductRequest): Promise<CreateProductResponse> => {
    try {
      console.log('Creating product:', data);
      
      const backendData = mapProductToBackend(data);
      
      const response = await api.post<any>(API_ENDPOINTS.PRODUCTS.CREATE, backendData);
      console.log('Backend create product response:', response);
      
      const mappedProduct = mapProductFromBackend(response.product || response);
      
      return {
        success: response.success || true,
        product: mappedProduct,
        message: response.message || 'Product created successfully',
      };
    } catch (error: any) {
      console.warn('Create product API not available:', error.message);
      throw new Error(error.message || 'Failed to create product');
    }
  },

  // Update product
  updateProduct: async (id: string, data: UpdateProductRequest): Promise<UpdateProductResponse> => {
    try {
      console.log('Updating product:', id, data);
      
      const backendData = mapProductToBackend(data);
      
      const response = await api.put<any>(`${API_ENDPOINTS.PRODUCTS.UPDATE}/${id}`, backendData);
      console.log('Backend update product response:', response);
      
      const mappedProduct = mapProductFromBackend(response.product || response);
      
      return {
        success: response.success || true,
        product: mappedProduct,
        message: response.message || 'Product updated successfully',
      };
    } catch (error: any) {
      console.warn('Update product API not available:', error.message);
      throw new Error(error.message || 'Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Deleting product:', id);
      
      const response = await api.delete<any>(`${API_ENDPOINTS.PRODUCTS.DELETE}/${id}`);
      console.log('Backend delete product response:', response);
      
      return {
        success: response.success || true,
        message: response.message || 'Product deleted successfully',
      };
    } catch (error: any) {
      console.warn('Delete product API not available:', error.message);
      throw new Error(error.message || 'Failed to delete product');
    }
  },

  // Upload product images
  uploadProductImages: async (productId: string, images: File[]): Promise<UploadImagesResponse> => {
    try {
      console.log('Uploading product images:', productId, images.length);
      
      const formData = new FormData();
      formData.append('productId', productId);
      
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });
      
      const response = await api.post<any>(`${API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGES}/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Backend upload images response:', response);
      
      return {
        success: response.success || true,
        imageUrls: response.imageUrls || response.image_urls || [],
        message: response.message || 'Images uploaded successfully',
      };
    } catch (error: any) {
      console.warn('Upload images API not available:', error.message);
      throw new Error(error.message || 'Failed to upload images');
    }
  },

  // Toggle favorite product
  toggleFavorite: async (productId: string): Promise<{ success: boolean; isFavorite: boolean; message: string }> => {
    try {
      console.log('Toggling favorite for product:', productId);
      
      const response = await api.post<any>(`${API_ENDPOINTS.PRODUCTS.TOGGLE_FAVORITE}/${productId}/favorite`);
      console.log('Backend toggle favorite response:', response);
      
      return {
        success: response.success || true,
        isFavorite: response.isFavorite || response.is_favorite || false,
        message: response.message || 'Favorite status updated',
      };
    } catch (error: any) {
      console.warn('Toggle favorite API not available:', error.message);
      throw new Error(error.message || 'Failed to update favorite status');
    }
  },
};

// Export service and types
export default productsService;
export type {
  Product,
  ProductFilters,
  ProductsResponse,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  UploadImagesRequest,
  UploadImagesResponse,
};