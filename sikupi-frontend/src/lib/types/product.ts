// FILE: src/lib/types/product.ts (Updated to fix TypeScript errors)
// Product types and interfaces
export interface Product {
  id: string;
  title: string;
  description: string;
  wasteType: "coffee_grounds" | "coffee_pulp" | "coffee_husks" | "coffee_chaff";
  quantityKg: number;
  pricePerKg: number;
  totalPrice: number;
  grade: "A" | "B" | "C";
  category: "pupuk" | "kompos" | "kerajinan" | "pakan";
  location: string;
  processingMethod: string;
  harvestDate: string;
  moistureContent: number;
  organicCertified: boolean;
  fairTradeCertified: boolean;
  status: "active" | "inactive" | "sold_out";
  images: string[];
  tags: string[];
  viewsCount: number;
  favoritesCount: number;
  sellerId: string;
  sellerName: string;
  sellerBusinessName: string;
  sellerRating: number;
  sellerReviewCount: number;
  sellerVerified: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product filters
export interface ProductFilters {
  search?: string;
  category?: string;
  wasteType?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  grade?: string;
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
