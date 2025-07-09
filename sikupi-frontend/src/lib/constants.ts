import { hrtime } from "process";

// FILE: src/lib/constants.ts
export const APP_CONFIG = {
  NAME: "Sikupi",
  description: "Smart Coffee Waste Marketplace",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  LOGO_PATH: "/sikupi-logo-removebg.png",
  version: "1.0.0",
};

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 10000,
  retries: 3,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  CART_DATA: "cart_data",
  THEME: "theme",
  LANGUAGE: "language",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/masuk",
  REGISTER: "/daftar",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/produk",
  CART: "/keranjang",
  CHECKOUT: "/checkout",
  EDUCATION: "/edukasi",
  PROFILE: "/dashboard/profil",
  ORDERS: "/dashboard/pesanan",
  SELLER_PRODUCTS: "/dashboard/produk",
};

export const USER_TYPES = {
  SELLER: "seller",
  BUYER: "buyer",
  ADMIN: "admin",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_METHODS = {
  BANK_TRANSFER: "bank_transfer",
  E_WALLET: "e_wallet",
  CREDIT_CARD: "credit_card",
  COD: "cod",
} as const;

export const PRODUCT_CATEGORIES = {
  PUPUK: "pupuk",
  KOMPOS: "kompos",
  KERAJINAN: "kerajinan",
  PAKAN: "pakan",
} as const;

export const WASTE_TYPES = {
  COFFEE_GROUNDS: "coffee_grounds",
  COFFEE_PULP: "coffee_pulp",
  COFFEE_HUSKS: "coffee_husks",
  COFFEE_CHAFF: "coffee_chaff",
} as const;

export const PRODUCT_GRADES = {
  A: "A",
  B: "B",
  C: "C",
} as const;

export const PAGINATION_LIMITS = {
  PRODUCTS: 12,
  ORDERS: 10,
  ARTICLES: 6,
  REVIEWS: 10,
} as const;

export const MOCK_CONFIG = {
  DELAY_MIN: 100,
  DELAY_MAX: 1000,
  ENABLE_ERRORS: false,
  ERROR_RATE: 0.1,
};


export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/ai-assessment", label: "AI Assessment" },
  { href: "/chatbot", label: "Chatbot" },
];

// Menu untuk pengguna yang sudah login
export const SELLER_MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/produk", label: "Produk Saya" },
  { href: "/dashboard/pesanan", label: "Pesanan" },
  { href: "/dashboard/profil", label: "Profil" },
];

export const BUYER_MENU_ITEMS = [
  { href: "/dashboard/pesanan", label: "Pesanan Saya" },
  { href: "/dashboard/favorit", label: "Favorit" },
  { href: "/dashboard/profil", label: "Profil" },
];