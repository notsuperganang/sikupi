// Base types
export type UserType = 'seller' | 'buyer' | 'admin';
export type ProductStatus = 'active' | 'inactive' | 'sold_out';
export type TransactionStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type WasteType = 'coffee_grounds' | 'coffee_pulp' | 'coffee_husks' | 'coffee_chaff';
export type QualityGrade = 'A' | 'B' | 'C' | 'D';

// User interfaces
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  user_type: UserType;
  business_name?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  profile_image_url?: string;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword?: string; // Add this for form validation
  full_name: string;
  phone?: string;
  user_type: UserType;
  business_name?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  agreeToTerms?: boolean; // Add this for form validation
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  refreshToken: string;
}

// Product interfaces
export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  waste_type: WasteType;
  quantity_kg: number;
  price_per_kg: number;
  quality_grade?: QualityGrade;
  processing_method?: string;
  origin_location?: string;
  harvest_date?: string;
  expiry_date?: string;
  moisture_content?: number;
  organic_certified: boolean;
  fair_trade_certified: boolean;
  status: ProductStatus;
  image_urls?: string[];
  tags?: string[];
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  users?: User; // Seller information
  product_images?: ProductImage[];
  is_favorited?: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  created_at: string;
}

export interface ProductFilters {
  search?: string;
  waste_type?: WasteType;
  quality_grade?: QualityGrade;
  min_price?: number;
  max_price?: number;
  city?: string;
  province?: string;
  organic_certified?: boolean;
  fair_trade_certified?: boolean;
  sort_by?: 'created_at' | 'price_per_kg' | 'title' | 'rating';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Transaction interfaces
export interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity_kg: number;
  price_per_kg: number;
  total_amount: number;
  status: TransactionStatus;
  payment_method?: string;
  payment_id?: string;
  shipping_address: string;
  shipping_cost: number;
  tracking_number?: string;
  notes?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  products?: Product;
  buyer?: User;
  seller?: User;
}

// Cart interfaces
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity_kg: number;
  created_at: string;
  updated_at: string;
  products?: Product;
}

export interface CartSummary {
  total_items: number;
  total_quantity_kg: number;
  total_amount: number;
  estimated_shipping: number;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
}

// AI Assessment interfaces
export interface AIAssessment {
  id: string;
  product_id?: string;
  user_id: string;
  image_url: string;
  assessment_data: {
    color: string;
    texture: string;
    moisture: string;
    contamination: string;
    particle_size: string;
    freshness: string;
    processing_quality: string;
  };
  quality_score: number;
  suggested_grade: QualityGrade;
  confidence_level: number;
  processing_time_ms: number;
  created_at: string;
  detailed_analysis?: string;
  recommendations?: string[];
  ai_provider?: string;
  model?: string;
}

// Article interfaces
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_id: string;
  category?: string;
  tags?: string[];
  is_published: boolean;
  views_count: number;
  reading_time_minutes?: number;
  created_at: string;
  updated_at: string;
  users?: User; // Author information
}

// Review interfaces
export interface Review {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
  reviewer?: User;
  transactions?: {
    id: string;
    products?: {
      title: string;
      waste_type: WasteType;
    };
  };
}

// Notification interfaces
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

// Dashboard interfaces
export interface PlatformMetrics {
  waste_diverted: {
    value: number;
    unit: string;
    description: string;
  };
  co2_emissions_saved: {
    value: number;
    unit: string;
    description: string;
  };
  active_products: {
    value: number;
    unit: string;
    description: string;
  };
  total_users: {
    value: number;
    unit: string;
    description: string;
  };
  recent_transactions: {
    value: number;
    unit: string;
    description: string;
  };
  trees_equivalent: {
    value: number;
    unit: string;
    description: string;
  };
  water_saved: {
    value: number;
    unit: string;
    description: string;
  };
}

export interface UserStats {
  user_type: UserType;
  profile: {
    rating: number;
    total_reviews: number;
    is_verified: boolean;
  };
  seller?: {
    total_products: number;
    active_products: number;
    total_sales: number;
    total_revenue: number;
    total_waste_sold: number;
  };
  buyer?: {
    total_purchases: number;
    total_spent: number;
    total_waste_purchased: number;
    favorites_count: number;
  };
  recent_activity: Transaction[];
}

// API Response interfaces
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form interfaces
export interface ProductForm {
  title: string;
  description?: string;
  waste_type: WasteType;
  quantity_kg: number;
  price_per_kg: number;
  quality_grade?: QualityGrade;
  processing_method?: string;
  origin_location?: string;
  harvest_date?: string;
  expiry_date?: string;
  moisture_content?: number;
  organic_certified: boolean;
  fair_trade_certified: boolean;
  tags?: string[];
}

export interface CheckoutForm {
  shipping_address: string;
  notes?: string;
}

// Error interfaces
export interface ApiError {
  error: string;
  message: string;
  details?: string;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStates {
  [key: string]: LoadingState;
}

// Chatbot interfaces
export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

export interface ChatbotResponse {
  success: boolean;
  message: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  responseTime: number;
  timestamp: string;
  sessionId: string;
  model: string;
  provider: string;
}

// Payment interfaces
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  test_info?: {
    [key: string]: string;
  };
}

// Shipping interfaces
export interface ShippingRate {
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  description: string;
  price: number;
  estimated_delivery: string;
  company: string;
}

export interface ShippingArea {
  id: string;
  name: string;
  type: string;
  postal_code: string;
  administrative_division_level_1_name: string;
  administrative_division_level_2_name: string;
  administrative_division_level_3_name: string;
}