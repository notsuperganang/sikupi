// FILE PATH: /sikupi-frontend/src/lib/constants.ts

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 
    (isDevelopment ? 'http://localhost:8000' : 'https://your-api-domain.com'),
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

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

// API endpoints - Updated to match backend routes
export const API_ENDPOINTS = {
  BASE_URL: API_CONFIG.BASE_URL,
  
  // Authentication endpoints
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/auth/profile",
    REFRESH: "/api/auth/refresh",
    CHANGE_PASSWORD: "/api/auth/change-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESEND_VERIFICATION: "/api/auth/resend-verification",
    CHECK_EMAIL: "/api/auth/check-email",
  },
  
  // Product endpoints
  PRODUCTS: {
    LIST: "/api/products",
    DETAIL: "/api/products",
    SEARCH: "/api/products/search",
    FEATURED: "/api/products/featured",
    MY_PRODUCTS: "/api/products/my-products",
    SELLER_PRODUCTS: "/api/products/seller",
    CREATE: "/api/products",
    UPDATE: "/api/products",
    DELETE: "/api/products",
    TOGGLE_FAVORITE: "/api/products",
    UPLOAD_IMAGES: "/api/products",
  },
  
  // Cart endpoints
  CART: {
    GET: "/api/cart",
    ADD_ITEM: "/api/cart/items",
    UPDATE_ITEM: "/api/cart/items",
    REMOVE_ITEM: "/api/cart/items",
    CLEAR: "/api/cart/clear",
  },
  
  // Order/Transaction endpoints
  ORDERS: {
    LIST: "/api/transactions",
    CREATE: "/api/transactions",
    DETAIL: "/api/transactions",
    UPDATE_STATUS: "/api/transactions",
    CANCEL: "/api/transactions",
    CONFIRM_DELIVERY: "/api/transactions",
    TRACKING: "/api/transactions",
  },
  
  // Payment endpoints
  PAYMENTS: {
    MIDTRANS_TOKEN: "/api/payments/midtrans/token",
    MIDTRANS_NOTIFICATION: "/api/payments/midtrans/notification",
    METHODS: "/api/payments/methods",
    VERIFY: "/api/payments/verify",
  },
  
  // Shipping endpoints
  SHIPPING: {
    RATES: "/api/shipping/rates",
    CREATE_ORDER: "/api/shipping/create-order",
    TRACK: "/api/shipping/track",
    AREAS: "/api/shipping/areas",
    PROVINCES: "/api/shipping/provinces",
    CITIES: "/api/shipping/cities",
  },
  
  // Dashboard & Analytics
  DASHBOARD: {
    METRICS: "/api/dashboard/metrics",
    USER_STATS: "/api/dashboard/user-stats",
    ADMIN_STATS: "/api/dashboard/admin-stats",
    SELLER_ANALYTICS: "/api/dashboard/seller-analytics",
    BUYER_ANALYTICS: "/api/dashboard/buyer-analytics",
  },
  
  // AI & Chatbot
  AI: {
    ASSESS_QUALITY: "/api/ai/assess",
    BATCH_ASSESS: "/api/ai/assess-batch",
    ASSESSMENTS: "/api/ai/assessments",
  },
  
  CHATBOT: {
    CHAT: "/api/chatbot/chat",
    HISTORY: "/api/chatbot/history",
  },
  
  // File uploads
  UPLOADS: {
    IMAGE: "/api/uploads/image",
    IMAGES: "/api/uploads/images",
    PROFILE_IMAGE: "/api/uploads/profile-image",
    PRODUCT_IMAGES: "/api/uploads/product-images",
  },
  
  // User management
  USERS: {
    PROFILE: "/api/users",
    PRODUCTS: "/api/users",
    REVIEWS: "/api/users",
    CREATE_REVIEW: "/api/users",
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    READ: "/api/notifications",
    READ_ALL: "/api/notifications/read-all",
    CREATE: "/api/notifications",
  },
  
  // Articles & Education
  ARTICLES: {
    LIST: "/api/articles",
    DETAIL: "/api/articles",
    CREATE: "/api/articles",
    UPDATE: "/api/articles",
    DELETE: "/api/articles",
  },
  
  // Health check
  HEALTH: "/api/health",
};

// App configuration
export const APP_CONFIG = {
  NAME: "Sikupi",
  DESCRIPTION: "Marketplace Ampas Kopi Cerdas",
  LOGO_PATH: "/sikupi-logo-removebg.png",
  FAVICON_PATH: "/favicon.ico",
  CONTACT_EMAIL: "sikupiteam@gmail.com",
  CONTACT_PHONE: "+62 853-3857-3726",
  SUPPORT_EMAIL: "support@sikupi.com",
  BUSINESS_EMAIL: "business@sikupi.com",
  
  // Social media
  SOCIAL_MEDIA: {
    INSTAGRAM: "https://instagram.com/sikupi",
    FACEBOOK: "https://facebook.com/sikupi",
    TWITTER: "https://twitter.com/sikupi",
    LINKEDIN: "https://linkedin.com/company/sikupi",
    YOUTUBE: "https://youtube.com/@sikupi",
  },
  
  // SEO
  SEO: {
    DEFAULT_TITLE: "Sikupi - Marketplace Ampas Kopi Cerdas",
    DEFAULT_DESCRIPTION: "Platform marketplace untuk jual beli ampas kopi berkualitas dengan teknologi AI. Solusi cerdas untuk pengolahan limbah kopi menjadi produk bernilai ekonomi.",
    DEFAULT_KEYWORDS: "ampas kopi, marketplace, coffee waste, pupuk organik, kompos, sustainable, eco-friendly",
    DEFAULT_IMAGE: "/og-image.jpg",
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://sikupi.com",
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,
    PRODUCT_PAGE_SIZE: 12,
    ORDER_PAGE_SIZE: 10,
    NOTIFICATION_PAGE_SIZE: 20,
  },
  
  // File upload limits
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES_PER_UPLOAD: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  // Business rules
  BUSINESS_RULES: {
    MIN_ORDER_AMOUNT: 25000, // Rp 25.000
    MAX_ORDER_AMOUNT: 10000000, // Rp 10.000.000
    FREE_SHIPPING_THRESHOLD: 100000, // Rp 100.000
    MIN_PRODUCT_PRICE: 5000, // Rp 5.000
    MAX_PRODUCT_PRICE: 1000000, // Rp 1.000.000
    COMMISSION_RATE: 0.05, // 5%
    PAYMENT_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
};

// Product categories
export const PRODUCT_CATEGORIES = [
  { value: "pupuk", label: "Pupuk Organik", icon: "🌱" },
  { value: "kompos", label: "Kompos", icon: "🍂" },
  { value: "craft", label: "Kerajinan", icon: "🎨" },
  { value: "bahan", label: "Bahan Baku", icon: "📦" },
  { value: "makanan", label: "Produk Makanan", icon: "🍪" },
  { value: "kosmetik", label: "Kosmetik", icon: "💄" },
];

// Coffee waste grades
export const COFFEE_GRADES = [
  { value: "A", label: "Grade A", description: "Kualitas terbaik, baru digiling" },
  { value: "B", label: "Grade B", description: "Kualitas baik, segar" },
  { value: "C", label: "Grade C", description: "Kualitas standar" },
];

// Order statuses
export const ORDER_STATUSES = [
  { value: "pending", label: "Menunggu Pembayaran", color: "yellow" },
  { value: "paid", label: "Dibayar", color: "blue" },
  { value: "processing", label: "Diproses", color: "purple" },
  { value: "shipped", label: "Dikirim", color: "orange" },
  { value: "delivered", label: "Diterima", color: "green" },
  { value: "cancelled", label: "Dibatalkan", color: "red" },
  { value: "refunded", label: "Dikembalikan", color: "gray" },
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Transfer Bank", icon: "🏦" },
  { value: "credit_card", label: "Kartu Kredit", icon: "💳" },
  { value: "e_wallet", label: "E-Wallet", icon: "📱" },
  { value: "cash_on_delivery", label: "Bayar di Tempat", icon: "💵" },
];

// Shipping couriers
export const SHIPPING_COURIERS = [
  { code: "jne", name: "JNE", logo: "/couriers/jne.png" },
  { code: "pos", name: "Pos Indonesia", logo: "/couriers/pos.png" },
  { code: "tiki", name: "TIKI", logo: "/couriers/tiki.png" },
  { code: "sicepat", name: "SiCepat", logo: "/couriers/sicepat.png" },
  { code: "jnt", name: "J&T Express", logo: "/couriers/jnt.png" },
  { code: "anteraja", name: "AnterAja", logo: "/couriers/anteraja.png" },
];

// Indonesian provinces for location selection
export const INDONESIAN_PROVINCES = [
  { value: "aceh", label: "Aceh" },
  { value: "sumut", label: "Sumatera Utara" },
  { value: "sumbar", label: "Sumatera Barat" },
  { value: "riau", label: "Riau" },
  { value: "kepri", label: "Kepulauan Riau" },
  { value: "jambi", label: "Jambi" },
  { value: "sumsel", label: "Sumatera Selatan" },
  { value: "babel", label: "Bangka Belitung" },
  { value: "bengkulu", label: "Bengkulu" },
  { value: "lampung", label: "Lampung" },
  { value: "jakarta", label: "DKI Jakarta" },
  { value: "jabar", label: "Jawa Barat" },
  { value: "banten", label: "Banten" },
  { value: "jateng", label: "Jawa Tengah" },
  { value: "yogya", label: "D.I. Yogyakarta" },
  { value: "jatim", label: "Jawa Timur" },
  { value: "bali", label: "Bali" },
  { value: "ntb", label: "Nusa Tenggara Barat" },
  { value: "ntt", label: "Nusa Tenggara Timur" },
  { value: "kalbar", label: "Kalimantan Barat" },
  { value: "kalteng", label: "Kalimantan Tengah" },
  { value: "kalsel", label: "Kalimantan Selatan" },
  { value: "kaltim", label: "Kalimantan Timur" },
  { value: "kaltara", label: "Kalimantan Utara" },
  { value: "sulut", label: "Sulawesi Utara" },
  { value: "sulteng", label: "Sulawesi Tengah" },
  { value: "sulsel", label: "Sulawesi Selatan" },
  { value: "sultra", label: "Sulawesi Tenggara" },
  { value: "gorontalo", label: "Gorontalo" },
  { value: "sulbar", label: "Sulawesi Barat" },
  { value: "maluku", label: "Maluku" },
  { value: "malut", label: "Maluku Utara" },
  { value: "papbar", label: "Papua Barat" },
  { value: "papua", label: "Papua" },
];

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Koneksi internet bermasalah. Silakan coba lagi.",
  SERVER_ERROR: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
  UNAUTHORIZED: "Sesi Anda telah berakhir. Silakan login kembali.",
  FORBIDDEN: "Anda tidak memiliki akses untuk melakukan aksi ini.",
  NOT_FOUND: "Data yang dicari tidak ditemukan.",
  VALIDATION_ERROR: "Data yang dimasukkan tidak valid.",
  TIMEOUT_ERROR: "Permintaan timeout. Silakan coba lagi.",
  UNKNOWN_ERROR: "Terjadi kesalahan yang tidak diketahui.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login berhasil!",
  REGISTER_SUCCESS: "Registrasi berhasil!",
  LOGOUT_SUCCESS: "Logout berhasil!",
  PROFILE_UPDATED: "Profil berhasil diperbarui!",
  PASSWORD_CHANGED: "Password berhasil diubah!",
  PRODUCT_CREATED: "Produk berhasil dibuat!",
  PRODUCT_UPDATED: "Produk berhasil diperbarui!",
  PRODUCT_DELETED: "Produk berhasil dihapus!",
  ORDER_CREATED: "Pesanan berhasil dibuat!",
  ORDER_CANCELLED: "Pesanan berhasil dibatalkan!",
  PAYMENT_SUCCESS: "Pembayaran berhasil!",
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "sikupi-auth",
  REMEMBER_ME: "sikupi_remember_me",
  CART: "sikupi-cart",
  SEARCH_HISTORY: "sikupi-search-history",
  USER_PREFERENCES: "sikupi-preferences",
  THEME: "sikupi-theme",
};

// Export everything
export default {
  API_CONFIG,
  API_ENDPOINTS,
  APP_CONFIG,
  NAV_LINKS,
  USER_MENU_ITEMS,
  FOOTER_LINKS,
  PRODUCT_CATEGORIES,
  COFFEE_GRADES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  SHIPPING_COURIERS,
  INDONESIAN_PROVINCES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
};