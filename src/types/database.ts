// Database Enums
export type ProductKind = 'ampas' | 'turunan';
export type ProductCategory = 'ampas_kopi' | 'briket' | 'pulp' | 'scrub' | 'pupuk' | 'pakan_ternak' | 'lainnya';
export type CoffeeType = 'arabika' | 'robusta' | 'mix' | 'unknown';
export type GrindLevel = 'halus' | 'sedang' | 'kasar' | 'unknown';
export type Condition = 'basah' | 'kering' | 'unknown';
export type OrderStatus = 'new' | 'pending_payment' | 'paid' | 'packed' | 'shipped' | 'completed' | 'cancelled';
export type UserRole = 'admin' | 'buyer';

// Database Tables
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  kind: ProductKind;
  category: ProductCategory;
  sku: string | null;
  title: string;
  slug: string | null;
  description: string | null;
  coffee_type: CoffeeType;
  grind_level: GrindLevel;
  condition: Condition;
  price_idr: number;
  stock_qty: number;
  unit: string;
  image_urls: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  buyer_id: string;
  status: OrderStatus;
  subtotal_idr: number;
  shipping_fee_idr: number;
  total_idr: number;
  shipping_address: any | null;
  biteship_order_id: string | null;
  courier_company: string | null;
  courier_service: string | null;
  tracking_number: string | null;
  shipping_status: string | null;
  midtrans_order_id: string | null;
  midtrans_token: string | null;
  payment_status: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_title: string;
  price_idr: number;
  qty: number;
  unit: string;
  coffee_type: CoffeeType | null;
  grind_level: GrindLevel | null;
  condition: Condition | null;
  image_url: string | null;
}

export interface ProductReview {
  id: number;
  product_id: number;
  order_item_id: number;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface MagazinePost {
  id: number;
  title: string;
  slug: string | null;
  summary: string | null;
  content_md: string | null;
  tags: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyzerJob {
  id: number;
  product_id: number | null;
  buyer_id: string | null;
  images: string[] | null;
  output: any | null;
  created_at: string;
}

// Supabase Database Schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & { id: string };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
      product_reviews: {
        Row: ProductReview;
        Insert: Omit<ProductReview, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductReview, 'id' | 'created_at'>>;
      };
      magazine_posts: {
        Row: MagazinePost;
        Insert: Omit<MagazinePost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MagazinePost, 'id' | 'created_at'>>;
      };
      analyzer_jobs: {
        Row: AnalyzerJob;
        Insert: Omit<AnalyzerJob, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyzerJob, 'id' | 'created_at'>>;
      };
    };
  };
}