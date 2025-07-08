// Navigation constants
export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/dampak", label: "Dampak" },
];

export const USER_MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profil", label: "Profil" },
  { href: "/pesanan", label: "Pesanan" },
  { href: "/favorit", label: "Favorit" },
];

export const FOOTER_LINKS = {
  company: [
    { href: "/tentang", label: "Tentang Kami" },
    { href: "/kontak", label: "Kontak" },
    { href: "/karir", label: "Karir" },
  ],
  support: [
    { href: "/bantuan", label: "Bantuan" },
    { href: "/faq", label: "FAQ" },
    { href: "/syarat", label: "Syarat & Ketentuan" },
    { href: "/privasi", label: "Kebijakan Privasi" },
  ],
  categories: [
    { href: "/produk?kategori=pupuk", label: "Pupuk Organik" },
    { href: "/produk?kategori=kompos", label: "Kompos" },
    { href: "/produk?kategori=craft", label: "Kerajinan" },
    { href: "/produk?kategori=bahan", label: "Bahan Baku" },
  ],
};

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    PROFILE: "/api/auth/profile",
    LOGOUT: "/api/auth/logout",
  },
  PRODUCTS: {
    LIST: "/api/products",
    DETAIL: "/api/products",
    SEARCH: "/api/products/search",
  },
  CART: {
    GET: "/api/cart",
    ADD: "/api/cart/add",
    UPDATE: "/api/cart/update",
    REMOVE: "/api/cart/remove",
    CLEAR: "/api/cart/clear",
  },
  ORDERS: {
    LIST: "/api/transactions",
    CREATE: "/api/transactions/create",
    DETAIL: "/api/transactions",
  },
  DASHBOARD: {
    METRICS: "/api/dashboard/metrics",
    ANALYTICS: "/api/dashboard/analytics",
  },
  AI: {
    ASSESS: "/api/ai/assess-quality",
    CHATBOT: "/api/chatbot/chat",
  },
};

// App constants
export const APP_CONFIG = {
  NAME: "Sikupi",
  DESCRIPTION: "Marketplace Ampas Kopi Cerdas",
  LOGO_PATH: "/sikupi-logo-removebg.png",
  CONTACT_EMAIL: "sikupiteam@gmail.com",
  CONTACT_PHONE: "+62 853-3857-3726",
  SOCIAL_MEDIA: {
    INSTAGRAM: "https://instagram.com/sikupi",
    TWITTER: "https://twitter.com/sikupi",
    FACEBOOK: "https://facebook.com/sikupi",
    LINKEDIN: "https://linkedin.com/company/sikupi",
  },
};

// Product categories
export const PRODUCT_CATEGORIES = [
  { id: "pupuk", label: "Pupuk Organik", icon: "🌱" },
  { id: "kompos", label: "Kompos", icon: "🍃" },
  { id: "craft", label: "Kerajinan", icon: "🎨" },
  { id: "bahan", label: "Bahan Baku", icon: "📦" },
  { id: "lainnya", label: "Lainnya", icon: "🔄" },
];

// Quality grades
export const QUALITY_GRADES = [
  { grade: "A", label: "Grade A - Sangat Baik", color: "#10B981" },
  { grade: "B", label: "Grade B - Baik", color: "#F59E0B" },
  { grade: "C", label: "Grade C - Cukup", color: "#EF4444" },
];

// User types
export const USER_TYPES = {
  SELLER: "seller",
  BUYER: "buyer",
  ADMIN: "admin",
};

// Transaction status
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Form validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  DESCRIPTION_MIN_LENGTH: 10,
  PRICE_MIN: 1000,
  STOCK_MIN: 1,
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_FILES: 5,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
};

// Currency format
export const CURRENCY_FORMAT = {
  LOCALE: "id-ID",
  CURRENCY: "IDR",
  OPTIONS: {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

// Date format
export const DATE_FORMAT = {
  LOCALE: "id-ID",
  OPTIONS: {
    year: "numeric" as const,
    month: "long" as const,
    day: "numeric" as const,
  },
  TIME_OPTIONS: {
    hour: "2-digit" as const,
    minute: "2-digit" as const,
  },
};