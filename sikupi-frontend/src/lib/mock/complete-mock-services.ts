// FILE: src/lib/mock/complete-mock-services.ts (Fixed Version)

import type { 
  Product, 
  ProductFilters, 
  ProductsResponse 
} from "@/lib/types/product";
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse 
} from "@/lib/types/auth";
import type { 
  Order, 
  OrdersResponse, 
  CreateOrderRequest, 
  CreateOrderResponse 
} from "@/lib/types/orders";
import type { 
  CartItem, 
  Cart, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from "@/lib/types/cart";

// ========================================
// MOCK DATA
// ========================================

// Mock Users
const MOCK_USERS: User[] = [
  {
    id: "user-001",
    email: "seller@sikupi.com",
    fullName: "Kopi Nusantara",
    phone: "08123456789",
    userType: "seller",
    address: "Jl. Kopi Raya No. 123",
    city: "Bandung",
    province: "Jawa Barat",
    postalCode: "40123",
    businessName: "CV. Kopi Nusantara",
    businessType: "Pengolahan Kopi",
    avatarUrl: "/sikupi-logo.jpeg",
    isVerified: true,
    emailVerified: true,
    phoneVerified: true,
    rating: 4.8,
    totalReviews: 156,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-07-01T10:30:00Z",
  },
  {
    id: "user-002",
    email: "buyer@sikupi.com",
    fullName: "Ahmad Fauzi",
    phone: "08987654321",
    userType: "buyer",
    address: "Jl. Merdeka No. 456",
    city: "Jakarta",
    province: "DKI Jakarta",
    postalCode: "10110",
    avatarUrl: "/sikupi-logo.jpeg",
    isVerified: true,
    emailVerified: true,
    phoneVerified: true,
    rating: 4.5,
    totalReviews: 23,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-07-01T11:00:00Z",
  },
];

// Mock Products (Extended)
const MOCK_PRODUCTS: Product[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Ampas Kopi Grade A Premium",
    description: "Ampas kopi berkualitas tinggi dari biji kopi arabika pilihan, cocok untuk pupuk organik dan kompos premium. Telah melalui proses seleksi ketat dengan kadar air optimal.",
    wasteType: "coffee_grounds",
    quantityKg: 25,
    pricePerKg: 15000,
    grade: "A",
    category: "pupuk",
    location: "Bandung, Jawa Barat",
    processingMethod: "Natural Process",
    harvestDate: "2024-06-15",
    moistureContent: 12.5,
    organicCertified: true,
    fairTradeCertified: true,
    status: "active",
    images: ["/ampas-kopi-premium1.png", "/ampas-kopi2.png"],
    tags: ["premium", "organik", "berkualitas"],
    viewsCount: 245,
    favoritesCount: 89,
    sellerId: "user-001",
    sellerName: "Kopi Nusantara",
    sellerBusinessName: "CV. Kopi Nusantara",
    sellerRating: 4.8,
    sellerReviewCount: 156,
    sellerVerified: true,
    totalPrice: 375000,
    isAvailable: true,
    createdAt: "2024-06-15T10:30:00Z",
    updatedAt: "2024-07-01T14:20:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Pulp Kopi Fermentasi Natural",
    description: "Pulp kopi hasil fermentasi natural, kaya nutrisi untuk tanaman. Proses fermentasi menghasilkan kompos berkualitas tinggi yang sempurna untuk pertanian organik.",
    wasteType: "coffee_pulp",
    quantityKg: 50,
    pricePerKg: 12000,
    grade: "B",
    category: "kompos",
    location: "Aceh Tengah, Aceh",
    processingMethod: "Fermentation",
    harvestDate: "2024-06-20",
    moistureContent: 15.2,
    organicCertified: true,
    fairTradeCertified: false,
    status: "active",
    images: ["/ampas-kopi2.png", "/ampas-kopi3.png"],
    tags: ["fermentasi", "natural", "kompos"],
    viewsCount: 189,
    favoritesCount: 67,
    sellerId: "user-001",
    sellerName: "Gayo Organik",
    sellerBusinessName: "UD. Gayo Organik",
    sellerRating: 4.6,
    sellerReviewCount: 98,
    sellerVerified: true,
    totalPrice: 600000,
    isAvailable: true,
    createdAt: "2024-06-20T09:15:00Z",
    updatedAt: "2024-06-28T16:45:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Kulit Kopi Kering Pilihan",
    description: "Kulit kopi kering berkualitas, cocok untuk bahan baku kerajinan dan pupuk organik. Sudah melalui proses pengeringan optimal dengan kadar air yang tepat.",
    wasteType: "coffee_husks",
    quantityKg: 30,
    pricePerKg: 8000,
    grade: "B",
    category: "kerajinan",
    location: "Toraja, Sulawesi Selatan",
    processingMethod: "Sun Dried",
    harvestDate: "2024-06-25",
    moistureContent: 8.5,
    organicCertified: false,
    fairTradeCertified: true,
    status: "active",
    images: ["/ampas-kopi3.png", "/ampas-kopi4.png"],
    tags: ["kering", "kerajinan", "natural"],
    viewsCount: 134,
    favoritesCount: 41,
    sellerId: "user-001",
    sellerName: "Toraja Heritage",
    sellerBusinessName: "PT. Toraja Heritage",
    sellerRating: 4.7,
    sellerReviewCount: 87,
    sellerVerified: true,
    totalPrice: 240000,
    isAvailable: true,
    createdAt: "2024-06-25T11:20:00Z",
    updatedAt: "2024-07-02T09:30:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Chaff Kopi Sangrai Premium",
    description: "Chaff kopi hasil sangrai premium, cocok untuk campuran pakan ternak dan bahan dasar pupuk organik. Memiliki kandungan protein tinggi.",
    wasteType: "coffee_chaff",
    quantityKg: 20,
    pricePerKg: 18000,
    grade: "A",
    category: "pupuk",
    location: "Temanggung, Jawa Tengah",
    processingMethod: "Organic Process",
    harvestDate: "2024-07-04",
    moistureContent: 7.8,
    organicCertified: true,
    fairTradeCertified: true,
    status: "active",
    images: ["/ampas-kopi-premium1.png"],
    tags: ["organik", "certified", "tanaman"],
    viewsCount: 221,
    favoritesCount: 95,
    sellerId: "user-001",
    sellerName: "Organic Temanggung",
    sellerBusinessName: "CV. Organic Temanggung",
    sellerRating: 4.9,
    sellerReviewCount: 178,
    sellerVerified: true,
    totalPrice: 360000,
    isAvailable: true,
    createdAt: "2024-07-04T10:15:00Z",
    updatedAt: "2024-07-07T15:25:00Z",
  }
];

// Mock Orders
const MOCK_ORDERS: Order[] = [
  {
    id: "order-001",
    orderNumber: "ORD-2024-001",
    buyerId: "user-002",
    sellerId: "user-001",
    productId: "550e8400-e29b-41d4-a716-446655440001",
    productTitle: "Ampas Kopi Grade A Premium",
    quantity: 2,
    pricePerKg: 15000,
    totalPrice: 30000,
    status: "pending",
    paymentMethod: "bank_transfer",
    paymentStatus: "pending",
    shippingAddress: "Jl. Merdeka No. 456, Jakarta, DKI Jakarta",
    shippingMethod: "jne_regular",
    shippingCost: 15000,
    trackingNumber: undefined, // Changed from null to undefined
    notes: undefined, // Changed from null to undefined
    createdAt: "2024-07-09T10:30:00Z",
    updatedAt: "2024-07-09T10:30:00Z",
  },
  {
    id: "order-002",
    orderNumber: "ORD-2024-002",
    buyerId: "user-002",
    sellerId: "user-001",
    productId: "550e8400-e29b-41d4-a716-446655440002",
    productTitle: "Pulp Kopi Fermentasi Natural",
    quantity: 5,
    pricePerKg: 12000,
    totalPrice: 60000,
    status: "processing",
    paymentMethod: "e_wallet",
    paymentStatus: "paid",
    shippingAddress: "Jl. Merdeka No. 456, Jakarta, DKI Jakarta",
    shippingMethod: "sicepat_regular",
    shippingCost: 12000,
    trackingNumber: "SP123456789",
    notes: "Mohon dikemas dengan baik",
    createdAt: "2024-07-08T09:15:00Z",
    updatedAt: "2024-07-09T08:45:00Z",
  },
];

// Mock Cart
let MOCK_CART: Cart = {
  id: "cart-001",
  userId: "user-002",
  items: [],
  totalItems: 0,
  totalWeight: 0,
  totalPrice: 0,
  createdAt: "2024-07-09T10:00:00Z",
  updatedAt: "2024-07-09T10:00:00Z",
};

// Mock Dashboard Data
const MOCK_DASHBOARD_DATA = {
  metrics: {
    totalRevenue: 15750000,
    pendingOrders: 8,
    totalProducts: 12,
    totalCustomers: 156,
    monthlyGrowth: {
      revenue: 23.5,
      orders: 15.2,
      sales: 18.7,
    },
    averageOrderValue: 450000,
    conversionRate: 0.12,
    topSellingProduct: "Ampas Kopi Grade A Premium",
    bestMonth: "Juni 2024",
  },
  recentOrders: [
    {
      id: "order-001",
      orderNumber: "ORD-2024-001",
      customerName: "Ahmad Fauzi",
      productTitle: "Ampas Kopi Grade A Premium",
      quantity: 2,
      total: 30000,
      status: "pending",
      createdAt: "2024-07-09T10:30:00Z",
    },
    {
      id: "order-002",
      orderNumber: "ORD-2024-002",
      customerName: "Ahmad Fauzi",
      productTitle: "Pulp Kopi Fermentasi Natural",
      quantity: 5,
      total: 60000,
      status: "processing",
      createdAt: "2024-07-08T09:15:00Z",
    },
  ],
  topProducts: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Ampas Kopi Grade A Premium",
      sales: 45,
      revenue: 1687500,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      title: "Chaff Kopi Sangrai Premium",
      sales: 32,
      revenue: 960000,
    },
  ],
};

// ========================================
// MOCK SERVICES
// ========================================

// Auth Service
const mockAuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Simulate password check (in real app, this would be hashed)
    if (credentials.password !== 'password123') {
      throw new Error('Invalid password');
    }
    
    return {
      success: true,
      user,
      token: 'mock-jwt-token-' + user.id,
      refreshToken: 'mock-refresh-token-' + user.id,
      message: 'Login successful'
    };
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: 'user-' + Date.now(),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      userType: data.userType,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      businessName: data.businessName,
      businessType: data.businessType,
      avatarUrl: '/sikupi-logo.jpeg',
      isVerified: false,
      emailVerified: false,
      phoneVerified: false,
      rating: 0,
      totalReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    MOCK_USERS.push(newUser);
    
    return {
      success: true,
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id,
      refreshToken: 'mock-refresh-token-' + newUser.id,
      message: 'Registration successful'
    };
  },

  getProfile: async (): Promise<{ user: User }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return first user as current user for demo
    return {
      user: MOCK_USERS[0]
    };
  },

  updateProfile: async (data: any): Promise<{ user: User }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedUser = { ...MOCK_USERS[0], ...data, updatedAt: new Date().toISOString() };
    MOCK_USERS[0] = updatedUser;
    
    return {
      user: updatedUser
    };
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Clear any stored tokens here
  }
};

// Products Service
const mockProductsService = {
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredProducts = [...MOCK_PRODUCTS];
    
    // Apply filters
    if (filters.search) {
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }
    
    if (filters.wasteType) {
      filteredProducts = filteredProducts.filter(p => p.wasteType === filters.wasteType);
    }
    
    if (filters.minPrice || filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => {
        const price = p.pricePerKg;
        return (!filters.minPrice || price >= filters.minPrice) &&
               (!filters.maxPrice || price <= filters.maxPrice);
      });
    }
    
    if (filters.location) {
      filteredProducts = filteredProducts.filter(p => 
        p.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters.grade) {
      filteredProducts = filteredProducts.filter(p => p.grade === filters.grade);
    }
    
    if (filters.organicCertified) {
      filteredProducts = filteredProducts.filter(p => p.organicCertified);
    }
    
    if (filters.fairTradeCertified) {
      filteredProducts = filteredProducts.filter(p => p.fairTradeCertified);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_low':
            return a.pricePerKg - b.pricePerKg;
          case 'price_high':
            return b.pricePerKg - a.pricePerKg;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'rating':
            return (b.sellerRating || 0) - (a.sellerRating || 0);
          case 'popular':
            return (b.viewsCount || 0) - (a.viewsCount || 0);
          default:
            return 0;
        }
      });
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredProducts.length / limit),
        totalItems: filteredProducts.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < filteredProducts.length,
        hasPreviousPage: page > 1,
      },
      filters: {
        categories: [
          { category: 'pupuk', count: 2, label: 'Pupuk Organik' },
          { category: 'kompos', count: 1, label: 'Kompos' },
          { category: 'kerajinan', count: 1, label: 'Kerajinan' },
        ],
        wasteTypes: [
          { type: 'coffee_grounds', count: 1, label: 'Ampas Kopi' },
          { type: 'coffee_pulp', count: 1, label: 'Pulp Kopi' },
          { type: 'coffee_husks', count: 1, label: 'Kulit Kopi' },
          { type: 'coffee_chaff', count: 1, label: 'Chaff Kopi' },
        ],
        qualityGrades: [
          { grade: 'A', count: 2, label: 'Grade A' },
          { grade: 'B', count: 2, label: 'Grade B' },
        ],
        locations: [
          { location: 'Bandung', count: 1 },
          { location: 'Aceh', count: 1 },
          { location: 'Toraja', count: 1 },
          { location: 'Temanggung', count: 1 },
        ],
        priceRange: {
          min: 8000,
          max: 18000,
        },
      },
    };
  },

  getProduct: async (id: string): Promise<{ product: Product }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return { product };
  },

  getFeaturedProducts: async (limit: number = 8): Promise<ProductsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const featuredProducts = MOCK_PRODUCTS
      .filter(p => p.sellerRating! > 4.5)
      .sort((a, b) => (b.sellerRating || 0) - (a.sellerRating || 0))
      .slice(0, limit);
    
    return {
      products: featuredProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: featuredProducts.length,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      filters: {
        categories: [],
        wasteTypes: [],
        qualityGrades: [],
        locations: [],
        priceRange: { min: 0, max: 0 },
      },
    };
  },

  getRecommendedProducts: async (productId?: string, limit: number = 6): Promise<ProductsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const recommendedProducts = MOCK_PRODUCTS
      .filter(p => p.id !== productId)
      .sort((a, b) => (b.sellerRating || 0) - (a.sellerRating || 0))
      .slice(0, limit);
    
    return {
      products: recommendedProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: recommendedProducts.length,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      filters: {
        categories: [],
        wasteTypes: [],
        qualityGrades: [],
        locations: [],
        priceRange: { min: 0, max: 0 },
      },
    };
  },

  getCategories: async (): Promise<{ wasteTypes: Array<{ type: string; count: number; label: string }> }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      wasteTypes: [
        { type: 'coffee_grounds', count: 1, label: 'Ampas Kopi' },
        { type: 'coffee_pulp', count: 1, label: 'Pulp Kopi' },
        { type: 'coffee_husks', count: 1, label: 'Kulit Kopi' },
        { type: 'coffee_chaff', count: 1, label: 'Chaff Kopi' },
      ],
    };
  },

  searchProducts: async (query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductsResponse> => {
    return mockProductsService.getProducts({ ...filters, search: query });
  },
};

// Cart Service
const mockCartService = {
  getCart: async (): Promise<{ cart: Cart }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { cart: MOCK_CART };
  },

  addToCart: async (data: AddToCartRequest): Promise<{ cart: Cart; item: CartItem }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const product = MOCK_PRODUCTS.find(p => p.id === data.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const existingItemIndex = MOCK_CART.items.findIndex(item => item.productId === data.productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = MOCK_CART.items[existingItemIndex];
      existingItem.quantity += data.quantity;
      existingItem.totalPrice = existingItem.quantity * product.pricePerKg;
      existingItem.updatedAt = new Date().toISOString();
    } else {
      // Add new item
      const newItem: CartItem = {
        id: 'cart-item-' + Date.now(),
        cartId: MOCK_CART.id,
        productId: data.productId,
        quantity: data.quantity,
        pricePerKg: product.pricePerKg,
        totalPrice: data.quantity * product.pricePerKg,
        product: product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_CART.items.push(newItem);
    }
    
    // Update cart totals
    MOCK_CART.totalItems = MOCK_CART.items.reduce((sum, item) => sum + item.quantity, 0);
    MOCK_CART.totalWeight = MOCK_CART.items.reduce((sum, item) => sum + item.quantity, 0);
    MOCK_CART.totalPrice = MOCK_CART.items.reduce((sum, item) => sum + item.totalPrice, 0);
    MOCK_CART.updatedAt = new Date().toISOString();
    
    return { 
      cart: MOCK_CART,
      item: MOCK_CART.items[existingItemIndex >= 0 ? existingItemIndex : MOCK_CART.items.length - 1]
    };
  },

  updateCartItem: async (itemId: string, data: UpdateCartItemRequest): Promise<{ cart: Cart; item: CartItem }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const itemIndex = MOCK_CART.items.findIndex(item => item.id === itemId);
    if (itemIndex < 0) {
      throw new Error('Cart item not found');
    }
    
    const item = MOCK_CART.items[itemIndex];
    item.quantity = data.quantity;
    item.totalPrice = data.quantity * item.pricePerKg;
    item.updatedAt = new Date().toISOString();
    
    // Update cart totals
    MOCK_CART.totalItems = MOCK_CART.items.reduce((sum, item) => sum + item.quantity, 0);
    MOCK_CART.totalWeight = MOCK_CART.items.reduce((sum, item) => sum + item.quantity, 0);
    MOCK_CART.totalPrice = MOCK_CART.items.reduce((sum, item) => sum + item.totalPrice, 0);
    MOCK_CART.updatedAt = new Date().toISOString();
    
    return { cart: MOCK_CART, item };
  },

  removeCartItem: async (itemId: string): Promise<{ cart: Cart }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    MOCK_CART.items = MOCK_CART.items.filter(item => item.id !== itemId);
    
    // Update cart totals
    MOCK_CART.totalItems = MOCK_CART.items.reduce((sum, item) => sum + item.quantity, 0);
    MOCK_CART.totalWeight = MOCK_CART.items.reduce((sum, item) => sum + item.quantity, 0);
    MOCK_CART.totalPrice = MOCK_CART.items.reduce((sum, item) => sum + item.totalPrice, 0);
    MOCK_CART.updatedAt = new Date().toISOString();
    
    return { cart: MOCK_CART };
  },

  clearCart: async (): Promise<{ cart: Cart }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    MOCK_CART.items = [];
    MOCK_CART.totalItems = 0;
    MOCK_CART.totalWeight = 0;
    MOCK_CART.totalPrice = 0;
    MOCK_CART.updatedAt = new Date().toISOString();
    
    return { cart: MOCK_CART };
  },
};

// Orders Service
const mockOrdersService = {
  getOrders: async (filters: any = {}): Promise<OrdersResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredOrders = [...MOCK_ORDERS];
    
    // Apply filters
    if (filters.status) {
      filteredOrders = filteredOrders.filter(o => o.status === filters.status);
    }
    
    if (filters.search) {
      filteredOrders = filteredOrders.filter(o => 
        o.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        o.productTitle.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    return {
      orders: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredOrders.length / limit),
        totalItems: filteredOrders.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < filteredOrders.length,
        hasPreviousPage: page > 1,
      },
    };
  },

  getOrder: async (id: string): Promise<{ order: Order }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const order = MOCK_ORDERS.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    return { order };
  },

  createOrder: async (data: any): Promise<CreateOrderResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const product = MOCK_PRODUCTS.find(p => p.id === data.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const newOrder: Order = {
      id: 'order-' + Date.now(),
      orderNumber: 'ORD-2024-' + String(Date.now()).slice(-3),
      buyerId: data.buyerId || "user-002",
      sellerId: product.sellerId,
      productId: data.productId,
      productTitle: product.title,
      quantity: data.quantity,
      pricePerKg: product.pricePerKg,
      totalPrice: data.quantity * product.pricePerKg,
      status: 'pending',
      paymentMethod: data.paymentMethod || 'bank_transfer',
      paymentStatus: 'pending',
      shippingAddress: data.shippingAddress || "",
      shippingMethod: data.shippingMethod || 'jne_regular',
      shippingCost: data.shippingCost || 0,
      trackingNumber: undefined,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    MOCK_ORDERS.push(newOrder);
    
    return {
      success: true,
      order: newOrder,
      message: 'Order created successfully'
    };
  },
};

// Dashboard Service
const mockDashboardService = {
  getMetrics: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_DASHBOARD_DATA.metrics;
  },

  getRecentActivity: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      orders: MOCK_DASHBOARD_DATA.recentOrders,
      products: MOCK_DASHBOARD_DATA.topProducts,
    };
  },

  getAnalytics: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      salesData: [
        { month: 'Jan', sales: 12000000, orders: 85 },
        { month: 'Feb', sales: 9800000, orders: 68 },
        { month: 'Mar', sales: 15200000, orders: 102 },
        { month: 'Apr', sales: 11500000, orders: 78 },
        { month: 'May', sales: 18700000, orders: 125 },
        { month: 'Jun', sales: 21300000, orders: 142 },
      ],
      topCategories: [
        { category: 'Pupuk Organik', sales: 8500000, percentage: 45 },
        { category: 'Kompos', sales: 4200000, percentage: 25 },
        { category: 'Kerajinan', sales: 3100000, percentage: 20 },
        { category: 'Pakan Ternak', sales: 1900000, percentage: 10 },
      ],
    };
  },
};

// Export all services
export {
  mockAuthService,
  mockProductsService,
  mockCartService,
  mockOrdersService,
  mockDashboardService,
  MOCK_PRODUCTS,
  MOCK_USERS,
  MOCK_ORDERS,
  MOCK_DASHBOARD_DATA,
};

// Default export
export default {
  auth: mockAuthService,
  products: mockProductsService,
  cart: mockCartService,
  orders: mockOrdersService,
  dashboard: mockDashboardService,
};