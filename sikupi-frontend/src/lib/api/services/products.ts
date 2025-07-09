// FILE PATH: /sikupi-frontend/src/lib/api/services/products.ts

import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';

// Product types matching backend schema
export interface Product {
  id: string;
  title: string;
  description: string;
  wasteType: 'coffee_grounds' | 'coffee_pulp' | 'coffee_husks' | 'coffee_chaff';
  quantityKg: number;
  pricePerKg: number;
  qualityGrade: 'A' | 'B' | 'C' | 'D';
  processingMethod?: string;
  originLocation: string;
  harvestDate?: string;
  expiryDate?: string;
  moistureContent?: number;
  organicCertified: boolean;
  fairTradeCertified: boolean;
  status: 'active' | 'inactive' | 'sold_out';
  imageUrls: string[];
  tags: string[];
  viewsCount: number;
  favoritesCount: number;
  
  // Seller information
  sellerId: string;
  sellerName: string;
  sellerBusinessName?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  sellerVerified?: boolean;
  
  // Computed fields
  totalPrice: number; // quantityKg * pricePerKg
  isAvailable: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  wasteType?: string;
  qualityGrade?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  sellerVerified?: boolean;
  status?: string;
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating' | 'popular';
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
    wasteTypes: Array<{ type: string; count: number }>;
    qualityGrades: Array<{ grade: string; count: number }>;
    priceRange: { min: number; max: number };
    locations: Array<{ location: string; count: number }>;
  };
}

export interface CreateProductRequest {
  title: string;
  description: string;
  wasteType: string;
  quantityKg: number;
  pricePerKg: number;
  qualityGrade?: string;
  processingMethod?: string;
  originLocation: string;
  harvestDate?: string;
  expiryDate?: string;
  moistureContent?: number;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  tags?: string[];
  images?: File[];
}

export interface CreateProductResponse {
  success: boolean;
  product: Product;
  message: string;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  quantityKg?: number;
  pricePerKg?: number;
  qualityGrade?: string;
  processingMethod?: string;
  originLocation?: string;
  harvestDate?: string;
  expiryDate?: string;
  moistureContent?: number;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  status?: string;
  tags?: string[];
}

export interface UpdateProductResponse {
  success: boolean;
  product: Product;
  message: string;
}

// Helper function to map backend product data to frontend format
function mapProductFromBackend(backendProduct: any): Product {
  return {
    id: backendProduct.id,
    title: backendProduct.title,
    description: backendProduct.description || '',
    wasteType: backendProduct.waste_type || backendProduct.wasteType,
    quantityKg: backendProduct.quantity_kg || backendProduct.quantityKg || 0,
    pricePerKg: backendProduct.price_per_kg || backendProduct.pricePerKg || 0,
    qualityGrade: backendProduct.quality_grade || backendProduct.qualityGrade || 'C',
    processingMethod: backendProduct.processing_method || backendProduct.processingMethod,
    originLocation: backendProduct.origin_location || backendProduct.originLocation || '',
    harvestDate: backendProduct.harvest_date || backendProduct.harvestDate,
    expiryDate: backendProduct.expiry_date || backendProduct.expiryDate,
    moistureContent: backendProduct.moisture_content || backendProduct.moistureContent,
    organicCertified: backendProduct.organic_certified || backendProduct.organicCertified || false,
    fairTradeCertified: backendProduct.fair_trade_certified || backendProduct.fairTradeCertified || false,
    status: backendProduct.status || 'active',
    imageUrls: backendProduct.image_urls || backendProduct.imageUrls || [],
    tags: backendProduct.tags || [],
    viewsCount: backendProduct.views_count || backendProduct.viewsCount || 0,
    favoritesCount: backendProduct.favorites_count || backendProduct.favoritesCount || 0,
    
    // Seller information
    sellerId: backendProduct.seller_id || backendProduct.sellerId,
    sellerName: backendProduct.seller?.full_name || backendProduct.sellerName || 'Unknown Seller',
    sellerBusinessName: backendProduct.seller?.business_name || backendProduct.sellerBusinessName,
    sellerRating: backendProduct.seller?.rating || backendProduct.sellerRating || 0,
    sellerReviewCount: backendProduct.seller?.total_reviews || backendProduct.sellerReviewCount || 0,
    sellerVerified: backendProduct.seller?.is_verified || backendProduct.sellerVerified || false,
    
    // Computed fields
    totalPrice: (backendProduct.quantity_kg || backendProduct.quantityKg || 0) * 
                (backendProduct.price_per_kg || backendProduct.pricePerKg || 0),
    isAvailable: (backendProduct.status || 'active') === 'active' && 
                 (backendProduct.quantity_kg || backendProduct.quantityKg || 0) > 0,
    
    // Timestamps
    createdAt: backendProduct.created_at || backendProduct.createdAt,
    updatedAt: backendProduct.updated_at || backendProduct.updatedAt,
  };
}

// Helper function to map frontend filters to backend query params
function mapFiltersToBackend(filters: ProductFilters) {
  const backendFilters: Record<string, any> = {};
  
  if (filters.search) backendFilters.search = filters.search;
  if (filters.wasteType) backendFilters.waste_type = filters.wasteType;
  if (filters.qualityGrade) backendFilters.quality_grade = filters.qualityGrade;
  if (filters.minPrice) backendFilters.min_price = filters.minPrice;
  if (filters.maxPrice) backendFilters.max_price = filters.maxPrice;
  if (filters.location) backendFilters.location = filters.location;
  if (filters.organicCertified !== undefined) backendFilters.organic_certified = filters.organicCertified;
  if (filters.fairTradeCertified !== undefined) backendFilters.fair_trade_certified = filters.fairTradeCertified;
  if (filters.sellerVerified !== undefined) backendFilters.seller_verified = filters.sellerVerified;
  if (filters.status) backendFilters.status = filters.status;
  if (filters.sortBy) backendFilters.sort_by = filters.sortBy;
  if (filters.page) backendFilters.page = filters.page;
  if (filters.limit) backendFilters.limit = filters.limit;
  
  return backendFilters;
}

// Helper function to map frontend product data to backend format
function mapProductToBackend(productData: CreateProductRequest | UpdateProductRequest) {
  const backendData: Record<string, any> = {};
  
  if ('title' in productData && productData.title) backendData.title = productData.title;
  if ('description' in productData && productData.description) backendData.description = productData.description;
  if ('wasteType' in productData && productData.wasteType) backendData.waste_type = productData.wasteType;
  if ('quantityKg' in productData && productData.quantityKg) backendData.quantity_kg = productData.quantityKg;
  if ('pricePerKg' in productData && productData.pricePerKg) backendData.price_per_kg = productData.pricePerKg;
  if ('qualityGrade' in productData && productData.qualityGrade) backendData.quality_grade = productData.qualityGrade;
  if ('processingMethod' in productData && productData.processingMethod) backendData.processing_method = productData.processingMethod;
  if ('originLocation' in productData && productData.originLocation) backendData.origin_location = productData.originLocation;
  if ('harvestDate' in productData && productData.harvestDate) backendData.harvest_date = productData.harvestDate;
  if ('expiryDate' in productData && productData.expiryDate) backendData.expiry_date = productData.expiryDate;
  if ('moistureContent' in productData && productData.moistureContent) backendData.moisture_content = productData.moistureContent;
  if ('organicCertified' in productData && productData.organicCertified !== undefined) backendData.organic_certified = productData.organicCertified;
  if ('fairTradeCertified' in productData && productData.fairTradeCertified !== undefined) backendData.fair_trade_certified = productData.fairTradeCertified;
  if ('status' in productData && productData.status) backendData.status = productData.status;
  if ('tags' in productData && productData.tags) backendData.tags = productData.tags;
  
  return backendData;
}

export const productsService = {
  // Get all products with filters
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
      const url = queryString ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}` : API_ENDPOINTS.PRODUCTS.LIST;
      
      const response = await api.get<any>(url);
      console.log('Backend products response:', response);
      
      // Map response to expected format
      const mappedProducts = response.products?.map(mapProductFromBackend) || [];
      
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
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    } catch (error: any) {
      console.warn('Products API not available, using fallback:', error.message);
      
      // Return mock data for development
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
      
      const response = await api.get<any>(`/api/products/featured?limit=${limit}`);
      console.log('Backend featured products response:', response);
      
      const mappedProducts = response.products?.map(mapProductFromBackend) || [];
      
      return { products: mappedProducts };
    } catch (error: any) {
      console.warn('Featured products API not available:', error.message);
      
      // Fallback to regular products
      const fallbackResponse = await productsService.getProducts({ limit, sortBy: 'popular' });
      return { products: fallbackResponse.products };
    }
  },

  // Get products by seller
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
        ? `/api/products/seller/${sellerId}?${queryString}`
        : `/api/products/seller/${sellerId}`;
      
      const response = await api.get<any>(url);
      const mappedProducts = response.products?.map(mapProductFromBackend) || [];
      
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
          priceRange: { min: 0, max: 100000 },
          locations: [],
        },
      };
    } catch (error: any) {
      console.warn('Seller products API not available:', error.message);
      return productsService.getProducts(filters);
    }
  },

  // Get my products (for authenticated seller)
  getMyProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    try {
      console.log('Fetching my products:', filters);
      
      const backendFilters = mapFiltersToBackend(filters);
      const params = new URLSearchParams();
      
      Object.entries(backendFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const queryString = params.toString();
      const url = queryString 
        ? `/api/products/my?${queryString}`
        : `/api/products/my`;
      
      const response = await api.get<any>(url);
      const mappedProducts = response.products?.map(mapProductFromBackend) || [];
      
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
      
      // Handle image upload if images are provided
      if (data.images && data.images.length > 0) {
        const formData = new FormData();
        
        // Append text fields
        Object.entries(backendData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Append images
        data.images.forEach((image, index) => {
          formData.append(`images`, image);
        });

        const response = await api.post<any>(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const mappedProduct = mapProductFromBackend(response.product || response);
        
        return {
          success: true,
          product: mappedProduct,
          message: response.message || 'Product created successfully',
        };
      } else {
        // Create product without images
        const response = await api.post<any>(API_ENDPOINTS.PRODUCTS.CREATE, backendData);
        const mappedProduct = mapProductFromBackend(response.product || response);
        
        return {
          success: true,
          product: mappedProduct,
          message: response.message || 'Product created successfully',
        };
      }
    } catch (error: any) {
      console.error('Create product error:', error);
      throw new Error(error.message || 'Failed to create product');
    }
  },

  // Update product
  updateProduct: async (id: string, data: UpdateProductRequest): Promise<UpdateProductResponse> => {
    try {
      console.log('Updating product:', id, data);
      
      const backendData = mapProductToBackend(data);
      const response = await api.put<any>(`${API_ENDPOINTS.PRODUCTS.UPDATE}/${id}`, backendData);
      const mappedProduct = mapProductFromBackend(response.product || response);
      
      return {
        success: true,
        product: mappedProduct,
        message: response.message || 'Product updated successfully',
      };
    } catch (error: any) {
      console.error('Update product error:', error);
      throw new Error(error.message || 'Failed to update product');
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Deleting product:', id);
      
      const response = await api.delete<any>(`${API_ENDPOINTS.PRODUCTS.DELETE}/${id}`);
      
      return {
        success: true,
        message: response.message || 'Product deleted successfully',
      };
    } catch (error: any) {
      console.error('Delete product error:', error);
      throw new Error(error.message || 'Failed to delete product');
    }
  },

  // Upload product images
  uploadProductImages: async (id: string, images: File[]): Promise<{ imageUrls: string[]; message: string }> => {
    try {
      console.log('Uploading product images:', id, images.length);
      
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post<any>(`/api/products/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        imageUrls: response.image_urls || response.imageUrls || [],
        message: response.message || 'Images uploaded successfully',
      };
    } catch (error: any) {
      console.error('Upload images error:', error);
      throw new Error(error.message || 'Failed to upload images');
    }
  },

  // Get product categories
  getCategories: async (): Promise<{ wasteTypes: Array<{ type: string; label: string; count: number }> }> => {
    try {
      console.log('Fetching product categories');
      
      const response = await api.get<any>('/api/products/categories');
      
      return {
        wasteTypes: response.waste_types || response.wasteTypes || [],
      };
    } catch (error: any) {
      console.warn('Categories API not available:', error.message);
      
      // Return default categories
      return {
        wasteTypes: [
          { type: 'coffee_grounds', label: 'Ampas Kopi', count: 0 },
          { type: 'coffee_pulp', label: 'Pulp Kopi', count: 0 },
          { type: 'coffee_husks', label: 'Kulit Kopi', count: 0 },
          { type: 'coffee_chaff', label: 'Sekam Kopi', count: 0 },
        ],
      };
    }
  },

  // Toggle product favorite
  toggleFavorite: async (id: string): Promise<{ isFavorite: boolean; message: string }> => {
    try {
      console.log('Toggling product favorite:', id);
      
      const response = await api.post<any>(`/api/products/${id}/favorite`);
      
      return {
        isFavorite: response.is_favorite || response.isFavorite || false,
        message: response.message || 'Favorite status updated',
      };
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      throw new Error(error.message || 'Failed to update favorite status');
    }
  },

  // Get product recommendations
  getRecommendedProducts: async (productId?: string, limit: number = 6): Promise<{ products: Product[] }> => {
    try {
      console.log('Fetching recommended products:', productId, limit);
      
      const url = productId 
        ? `/api/products/recommended?product_id=${productId}&limit=${limit}`
        : `/api/products/recommended?limit=${limit}`;
      
      const response = await api.get<any>(url);
      const mappedProducts = response.products?.map(mapProductFromBackend) || [];
      
      return { products: mappedProducts };
    } catch (error: any) {
      console.warn('Recommended products API not available:', error.message);
      
      // Fallback to popular products
      const fallbackResponse = await productsService.getProducts({ limit, sortBy: 'popular' });
      return { products: fallbackResponse.products };
    }
  },
};