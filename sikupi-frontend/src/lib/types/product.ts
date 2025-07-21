// FILE: sikupi-frontend/src/lib/types/product.ts
// PERBAIKAN INTERFACE PRODUCT - Tambah expiryDate dan fields lainnya

export interface Product {
  id: string;
  title: string;
  description: string;
  wasteType: "coffee_grounds" | "coffee_pulp" | "coffee_husks" | "coffee_chaff";
  quantityKg: number;
  pricePerKg: number;
  totalPrice?: number;
  
  // Quality & Category
  grade?: "A" | "B" | "C"; // Legacy field for compatibility
  qualityGrade?: "A" | "B" | "C"; // Primary field from backend
  category?: "pupuk" | "kompos" | "kerajinan" | "pakan";
  
  // Location fields
  location?: string; // Legacy field for compatibility 
  originLocation?: string; // Primary field from backend
  
  // Processing & Date fields
  processingMethod?: string;
  harvestDate?: string | null;
  expiryDate?: string | null; // FIX: Add missing expiryDate field
  
  // Content properties
  moistureContent?: number | null;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  
  // Status & Media
  status: "active" | "inactive" | "sold_out";
  images: string[];
  tags: string[];
  
  // Engagement metrics
  viewsCount: number;
  favoritesCount: number;
  
  // Seller references
  sellerId: string;
  sellerName?: string; // Legacy fields
  sellerBusinessName?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  sellerVerified?: boolean;
  
  // User interaction
  isAvailable?: boolean;
  isFavorited?: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Seller info (from backend join)
  seller?: {
    id: string;
    fullName: string;
    businessName?: string | null;
    city?: string | null;
    province?: string | null;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    phone?: string | null;
    email?: string | null;
  } | null;
}

// Product filters - UPDATED to match implementation
export interface ProductFilters {
  search?: string;
  category?: string;
  wasteType?: string;
  grade?: string; // Maps to qualityGrade on backend
  minPrice?: number;
  maxPrice?: number;
  location?: string; // Maps to city on backend
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "rating" | "popular";
  page?: number;
  limit?: number;
  status?: string;
}

// Product response with pagination and filters
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

// Product creation/update DTOs
export interface CreateProductRequest {
  title: string;
  description: string;
  wasteType: string;
  quantityKg: number;
  pricePerKg: number;
  grade?: string;
  category?: string;
  location?: string;
  processingMethod?: string;
  harvestDate?: string;
  expiryDate?: string; // Include expiryDate in request
  moistureContent?: number;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  tags?: string[];
  images?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: "active" | "inactive" | "sold_out";
}

// Product categories response
export interface ProductCategoryInfo {
  value: string;
  label: string;
  count: number;
  description?: string;
}

export interface ProductCategoriesResponse {
  wasteTypes: ProductCategoryInfo[];
  qualityGrades: ProductCategoryInfo[];
  categories?: ProductCategoryInfo[];
}

// Additional utility interfaces
export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductStats {
  totalViews: number;
  totalFavorites: number;
  averageRating: number;
  totalReviews: number;
  salesCount: number;
}

export interface ProductSummary {
  id: string;
  title: string;
  pricePerKg: number;
  location: string;
  grade: string;
  image: string;
  sellerName: string;
  sellerRating: number;
  isAvailable: boolean;
}

export interface FeaturedProduct extends Product {
  featured: boolean;
  featuredReason?: string;
  displayOrder?: number;
}

// Export type utilities
export type ProductSortBy = ProductFilters["sortBy"];
export type ProductWasteType = Product["wasteType"];
export type ProductGrade = Product["grade"];
export type ProductStatus = Product["status"];
export type ProductCategoryType = Product["category"];