// FILE PATH: /src/lib/types/product.ts

// Enhanced Product types with frontend compatibility
export interface Product {
  id: string;
  title: string;
  description: string;
  
  // Core product data
  wasteType: 'coffee_grounds' | 'coffee_pulp' | 'coffee_husks' | 'coffee_chaff';
  quantityKg: number;
  pricePerKg: number;
  
  // Grade and category - frontend naming for compatibility
  grade: 'A' | 'B' | 'C' | 'D';  // alias for qualityGrade
  category: string; // new field for product categories (pupuk, kompos, etc)
  
  // Location and processing
  location: string; // alias for originLocation
  processingNotes?: string; // new field for processing information
  processingMethod?: string;
  harvestDate?: string;
  expiryDate?: string;
  moistureContent?: number;
  
  // Certifications
  organicCertified: boolean;
  fairTradeCertified: boolean;
  
  // Status and images
  status: 'active' | 'inactive' | 'sold_out';
  images: string[]; // alias for imageUrls
  tags: string[];
  
  // Metrics
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
  totalPrice: number;
  isAvailable: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Backend compatibility - these will be mapped from backend response
  qualityGrade?: 'A' | 'B' | 'C' | 'D'; // backend field
  originLocation?: string; // backend field
  imageUrls?: string[]; // backend field
}

// Enhanced ProductFilters with all needed fields
export interface ProductFilters {
  // Search and basic filters
  search?: string;
  wasteType?: string;
  
  // Frontend-compatible filters
  category?: string;
  categories?: string[]; // for multi-select
  grade?: string;
  grades?: string[]; // for multi-select
  
  // Price range
  priceMin?: number;
  priceMax?: number;
  minPrice?: number; // backend compatibility
  maxPrice?: number; // backend compatibility
  
  // Location
  location?: string;
  locations?: string[]; // for multi-select
  
  // Quality and verification
  minRating?: number;
  verifiedOnly?: boolean;
  stockAvailable?: boolean;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  sellerVerified?: boolean;
  
  // Status and sorting
  status?: string;
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating' | 'popular';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Backend compatibility
  qualityGrade?: string;
  inStock?: boolean; // alias for stockAvailable
  verified?: boolean; // alias for verifiedOnly
  sellerType?: string;
}

export interface ProductSort {
  field: "newest" | "oldest" | "price_low" | "price_high" | "rating" | "popular";
  direction: "asc" | "desc";
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
    wasteTypes: Array<{ type: string; count: number; label?: string }>;
    qualityGrades: Array<{ grade: string; count: number; label?: string }>;
    categories: Array<{ category: string; count: number; label?: string }>;
    priceRange: { min: number; max: number };
    locations: Array<{ location: string; count: number }>;
  };
}

// Create and Update requests
export interface CreateProductRequest {
  title: string;
  description: string;
  wasteType: string;
  category: string;
  grade: string;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  processingNotes?: string;
  processingMethod?: string;
  harvestDate?: string;
  expiryDate?: string;
  moistureContent?: number;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  tags?: string[];
  images: string[]; // image URLs after upload
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  category?: string;
  grade?: string;
  quantityKg?: number;
  pricePerKg?: number;
  location?: string;
  processingNotes?: string;
  processingMethod?: string;
  harvestDate?: string;
  expiryDate?: string;
  moistureContent?: number;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  status?: string;
  tags?: string[];
  images?: string[];
}

export interface CreateProductResponse {
  success: boolean;
  product: Product;
  message: string;
}

export interface UpdateProductResponse {
  success: boolean;
  product: Product;
  message: string;
}

// Upload images types
export interface UploadImagesRequest {
  id: string; // product ID
  images: File[];
}

export interface UploadImagesResponse {
  success: boolean;
  imageUrls: string[];
  message: string;
}

// Helper function to map backend product to frontend-compatible product
export function mapProductFromBackend(backendProduct: any): Product {
  return {
    id: backendProduct.id,
    title: backendProduct.title,
    description: backendProduct.description || '',
    wasteType: backendProduct.waste_type || backendProduct.wasteType,
    quantityKg: backendProduct.quantity_kg || backendProduct.quantityKg || 0,
    pricePerKg: backendProduct.price_per_kg || backendProduct.pricePerKg || 0,
    
    // Map grade (frontend) from qualityGrade (backend)
    grade: backendProduct.quality_grade || backendProduct.qualityGrade || backendProduct.grade || 'C',
    category: backendProduct.category || deriveCategory(backendProduct.waste_type || backendProduct.wasteType),
    
    // Map location (frontend) from originLocation (backend)
    location: backendProduct.origin_location || backendProduct.originLocation || backendProduct.location || '',
    processingNotes: backendProduct.processing_notes || backendProduct.processingNotes,
    processingMethod: backendProduct.processing_method || backendProduct.processingMethod,
    harvestDate: backendProduct.harvest_date || backendProduct.harvestDate,
    expiryDate: backendProduct.expiry_date || backendProduct.expiryDate,
    moistureContent: backendProduct.moisture_content || backendProduct.moistureContent,
    organicCertified: backendProduct.organic_certified || backendProduct.organicCertified || false,
    fairTradeCertified: backendProduct.fair_trade_certified || backendProduct.fairTradeCertified || false,
    status: backendProduct.status || 'active',
    
    // Map images (frontend) from imageUrls (backend)
    images: backendProduct.image_urls || backendProduct.imageUrls || backendProduct.images || [],
    tags: backendProduct.tags || [],
    viewsCount: backendProduct.views_count || backendProduct.viewsCount || 0,
    favoritesCount: backendProduct.favorites_count || backendProduct.favoritesCount || 0,
    
    // Seller information
    sellerId: backendProduct.seller_id || backendProduct.sellerId || '',
    sellerName: backendProduct.seller_name || backendProduct.sellerName || 'Unknown Seller',
    sellerBusinessName: backendProduct.seller_business_name || backendProduct.sellerBusinessName,
    sellerRating: backendProduct.seller_rating || backendProduct.sellerRating,
    sellerReviewCount: backendProduct.seller_review_count || backendProduct.sellerReviewCount,
    sellerVerified: backendProduct.seller_verified || backendProduct.sellerVerified || false,
    
    // Computed fields
    totalPrice: (backendProduct.quantity_kg || backendProduct.quantityKg || 0) * 
                (backendProduct.price_per_kg || backendProduct.pricePerKg || 0),
    isAvailable: backendProduct.is_available !== undefined ? 
                 backendProduct.is_available : 
                 (backendProduct.isAvailable !== undefined ? backendProduct.isAvailable : true),
    
    // Timestamps
    createdAt: backendProduct.created_at || backendProduct.createdAt || new Date().toISOString(),
    updatedAt: backendProduct.updated_at || backendProduct.updatedAt || new Date().toISOString(),
    
    // Keep backend fields for compatibility
    qualityGrade: backendProduct.quality_grade || backendProduct.qualityGrade,
    originLocation: backendProduct.origin_location || backendProduct.originLocation,
    imageUrls: backendProduct.image_urls || backendProduct.imageUrls,
  };
}

// Helper function to derive category from waste type
function deriveCategory(wasteType?: string): string {
  if (!wasteType) return 'bahan';
  
  const wasteTypeLower = wasteType.toLowerCase();
  if (wasteTypeLower.includes('grounds') || wasteTypeLower.includes('ampas')) {
    return 'pupuk';
  }
  if (wasteTypeLower.includes('pulp') || wasteTypeLower.includes('kompos')) {
    return 'kompos';
  }
  if (wasteTypeLower.includes('husk') || wasteTypeLower.includes('chaff')) {
    return 'craft';
  }
  
  return 'bahan';
}

// Helper function to map frontend product to backend format
export function mapProductToBackend(productData: CreateProductRequest | UpdateProductRequest) {
  const backendData: Record<string, any> = {};
  
  if ('title' in productData && productData.title) backendData.title = productData.title;
  if ('description' in productData && productData.description) backendData.description = productData.description;
  if ('wasteType' in productData && productData.wasteType) backendData.waste_type = productData.wasteType;
  if ('quantityKg' in productData && productData.quantityKg) backendData.quantity_kg = productData.quantityKg;
  if ('pricePerKg' in productData && productData.pricePerKg) backendData.price_per_kg = productData.pricePerKg;
  
  // Map grade (frontend) to qualityGrade (backend)
  if ('grade' in productData && productData.grade) backendData.quality_grade = productData.grade;
  
  // Map location (frontend) to originLocation (backend)
  if ('location' in productData && productData.location) backendData.origin_location = productData.location;
  
  if ('processingNotes' in productData && productData.processingNotes) backendData.processing_notes = productData.processingNotes;
  if ('processingMethod' in productData && productData.processingMethod) backendData.processing_method = productData.processingMethod;
  if ('harvestDate' in productData && productData.harvestDate) backendData.harvest_date = productData.harvestDate;
  if ('expiryDate' in productData && productData.expiryDate) backendData.expiry_date = productData.expiryDate;
  if ('moistureContent' in productData && productData.moistureContent) backendData.moisture_content = productData.moistureContent;
  if ('organicCertified' in productData && productData.organicCertified !== undefined) backendData.organic_certified = productData.organicCertified;
  if ('fairTradeCertified' in productData && productData.fairTradeCertified !== undefined) backendData.fair_trade_certified = productData.fairTradeCertified;
  if ('status' in productData && productData.status) backendData.status = productData.status;
  if ('tags' in productData && productData.tags) backendData.tags = productData.tags;
  
  // Map images (frontend) to imageUrls (backend)
  if ('images' in productData && productData.images) backendData.image_urls = productData.images;
  
  return backendData;
}

// Helper function to map frontend filters to backend format
export function mapFiltersToBackend(filters: ProductFilters) {
  const backendFilters: Record<string, any> = {};
  
  if (filters.search) backendFilters.search = filters.search;
  if (filters.wasteType) backendFilters.waste_type = filters.wasteType;
  if (filters.grade) backendFilters.quality_grade = filters.grade;
  if (filters.qualityGrade) backendFilters.quality_grade = filters.qualityGrade;
  if (filters.minPrice || filters.priceMin) backendFilters.min_price = filters.minPrice || filters.priceMin;
  if (filters.maxPrice || filters.priceMax) backendFilters.max_price = filters.maxPrice || filters.priceMax;
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