export const APP_CONFIG = {
  name: 'Sikupi',
  description: 'Smart Coffee Waste Marketplace',
  version: '1.0.0',
  author: 'Sikupi Team',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
  },
};

export const WASTE_TYPES = [
  { value: 'coffee_grounds', label: 'Coffee Grounds', icon: '☕' },
  { value: 'coffee_pulp', label: 'Coffee Pulp', icon: '🍒' },
  { value: 'coffee_husks', label: 'Coffee Husks', icon: '🌾' },
  { value: 'coffee_chaff', label: 'Coffee Chaff', icon: '🌿' },
] as const;

export const QUALITY_GRADES = [
  { value: 'A', label: 'Grade A (Premium)', color: 'green' },
  { value: 'B', label: 'Grade B (Good)', color: 'blue' },
  { value: 'C', label: 'Grade C (Fair)', color: 'yellow' },
  { value: 'D', label: 'Grade D (Basic)', color: 'red' },
] as const;

export const TRANSACTION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const USER_TYPES = [
  { value: 'buyer', label: 'Buyer', description: 'Purchase coffee waste products' },
  { value: 'seller', label: 'Seller', description: 'Sell coffee waste products' },
] as const;

export const PROVINCES = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'DI Yogyakarta',
  'Sumatera Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Bali',
  'Kalimantan Timur',
  'Sulawesi Selatan',
  // Add more provinces as needed
] as const;

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'price_per_kg', label: 'Price' },
  { value: 'title', label: 'Name' },
  { value: 'rating', label: 'Rating' },
] as const;

export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 50,
} as const;

export const VALIDATION = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    minLength: 'Password must be at least 6 characters',
  },
  phone: {
    invalid: 'Please enter a valid Indonesian phone number',
  },
  required: 'This field is required',
} as const;

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 5,
} as const;