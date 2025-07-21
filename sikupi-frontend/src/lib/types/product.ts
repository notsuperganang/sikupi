// FILE 1: sikupi-frontend/src/lib/types/product.ts
// GANTI line 112 dan 171 untuk fix duplicate identifier:

export interface Product {
  id: string;
  title: string;
  description: string;
  wasteType: "coffee_grounds" | "coffee_pulp" | "coffee_husks" | "coffee_chaff";
  quantityKg: number;
  pricePerKg: number;
  totalPrice?: number;
  grade?: "A" | "B" | "C";
  category?: "pupuk" | "kompos" | "kerajinan" | "pakan";
  location?: string;
  processingMethod?: string;
  harvestDate?: string;
  moistureContent?: number;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  status: "active" | "inactive" | "sold_out";
  images: string[];
  tags: string[];
  viewsCount: number;
  favoritesCount: number;
  sellerId: string;
  sellerName?: string;
  sellerBusinessName?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  sellerVerified?: boolean;
  isAvailable?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;

  // Seller info (from backend join)
  seller?: {
    id: string;
    fullName: string;
    businessName?: string;
    city?: string;
    province?: string;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    phone?: string;
    email?: string;
  };
}

// Product filters - UPDATED to match implementation
export interface ProductFilters {
  search?: string;
  category?: string;
  wasteType?: string;
  grade?: string; // Untuk backend mapping ke qualityGrade
  minPrice?: number;
  maxPrice?: number;
  location?: string; // Untuk backend mapping ke city
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  sortBy?: "newest" | "oldest" | "price_low" | "price_high" | "rating" | "popular";
  page?: number;
  limit?: number;
  status?: string;
}

// Product response with filters
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
  moistureContent?: number;
  organicCertified?: boolean;
  fairTradeCertified?: boolean;
  tags?: string[];
  images?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: "active" | "inactive" | "sold_out";
}

// FIXED: Rename to avoid duplicate identifier
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

// Product search/filter options
export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

// Product stats
export interface ProductStats {
  totalViews: number;
  totalFavorites: number;
  averageRating: number;
  totalReviews: number;
  salesCount: number;
}

// Quick product info for cards/lists
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

// Featured product interface
export interface FeaturedProduct extends Product {
  featured: boolean;
  featuredReason?: string;
  displayOrder?: number;
}

// Export type utilities - FIXED: Use string union instead of interface name
export type ProductSortBy = ProductFilters["sortBy"];
export type ProductWasteType = Product["wasteType"];
export type ProductGrade = Product["grade"];
export type ProductStatus = Product["status"];
export type ProductCategoryType = Product["category"]; // Renamed to avoid duplicate