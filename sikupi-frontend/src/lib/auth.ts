import { User } from '@/types';
import { storage } from './utils';

// Token and user data keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

/**
 * Authentication utilities for managing user sessions
 */
export class AuthManager {
  /**
   * Save authentication data to localStorage
   */
  static saveAuth(token: string, refreshToken: string, user: User): void {
    storage.set(TOKEN_KEY, token);
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
    storage.set(USER_KEY, user);
  }

  /**
   * Get authentication token
   */
  static getToken(): string | null {
    return storage.get<string>(TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return storage.get<string>(REFRESH_TOKEN_KEY);
  }

  /**
   * Get current user data
   */
  static getUser(): User | null {
    return storage.get<User>(USER_KEY);
  }

  /**
   * Update user data in localStorage
   */
  static updateUser(user: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      storage.set(USER_KEY, updatedUser);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Check if user has specific role
   */
  static hasRole(requiredRole: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.user_type);
  }

  /**
   * Check if user is seller
   */
  static isSeller(): boolean {
    return this.hasRole(['seller', 'admin']);
  }

  /**
   * Check if user is buyer
   */
  static isBuyer(): boolean {
    return this.hasRole(['buyer', 'admin']);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is verified
   */
  static isVerified(): boolean {
    const user = this.getUser();
    return user?.is_verified || false;
  }

  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    storage.remove(TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove(USER_KEY);
  }

  /**
   * Logout user and clear data
   */
  static logout(): void {
    this.clearAuth();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Check if token is expired (basic check)
   */
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Initialize authentication state on app load
   */
  static initializeAuth(): { isAuthenticated: boolean; user: User | null } {
    const isAuthenticated = this.isAuthenticated() && !this.isTokenExpired();
    const user = isAuthenticated ? this.getUser() : null;

    // Clear expired authentication
    if (!isAuthenticated) {
      this.clearAuth();
    }

    return { isAuthenticated, user };
  }
}

/**
 * Route protection utilities
 */
export const RouteProtection = {
  /**
   * Check if route requires authentication
   */
  requiresAuth: (pathname: string): boolean => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/cart',
      '/orders',
      '/sell',
      '/favorites',
    ];
    
    return protectedRoutes.some(route => pathname.startsWith(route));
  },

  /**
   * Check if route requires seller role
   */
  requiresSeller: (pathname: string): boolean => {
    const sellerRoutes = [
      '/dashboard/seller',
      '/sell',
      '/products/create',
      '/products/edit',
    ];
    
    return sellerRoutes.some(route => pathname.startsWith(route));
  },

  /**
   * Check if route requires buyer role
   */
  requiresBuyer: (pathname: string): boolean => {
    const buyerRoutes = [
      '/dashboard/buyer',
      '/cart',
      '/checkout',
      '/orders',
    ];
    
    return buyerRoutes.some(route => pathname.startsWith(route));
  },

  /**
   * Check if route requires admin role
   */
  requiresAdmin: (pathname: string): boolean => {
    const adminRoutes = [
      '/admin',
      '/dashboard/admin',
    ];
    
    return adminRoutes.some(route => pathname.startsWith(route));
  },

  /**
   * Get redirect URL for unauthorized access
   */
  getRedirectUrl: (pathname: string): string => {
    if (RouteProtection.requiresAuth(pathname)) {
      return `/login?redirect=${encodeURIComponent(pathname)}`;
    }
    return '/';
  },
};

/**
 * Permission utilities
 */
export const Permissions = {
  /**
   * Check if user can edit product
   */
  canEditProduct: (productSellerId: string): boolean => {
    const user = AuthManager.getUser();
    return !!(user && (user.id === productSellerId || user.user_type === 'admin'));
  },

  /**
   * Check if user can delete product
   */
  canDeleteProduct: (productSellerId: string): boolean => {
    return Permissions.canEditProduct(productSellerId);
  },

  /**
   * Check if user can view transaction
   */
  canViewTransaction: (transaction: { buyer_id: string; seller_id: string }): boolean => {
    const user = AuthManager.getUser();
    return !!(user && (
      user.id === transaction.buyer_id || 
      user.id === transaction.seller_id || 
      user.user_type === 'admin'
    ));
  },

  /**
   * Check if user can update transaction status
   */
  canUpdateTransactionStatus: (transaction: { buyer_id: string; seller_id: string }, newStatus: string): boolean => {
    const user = AuthManager.getUser();
    if (!user) return false;

    // Admin can update any status
    if (user.user_type === 'admin') return true;

    // Sellers can confirm and ship orders
    if (user.id === transaction.seller_id && ['confirmed', 'shipped'].includes(newStatus)) {
      return true;
    }

    // Buyers can mark as delivered
    if (user.id === transaction.buyer_id && newStatus === 'delivered') {
      return true;
    }

    // Both parties can cancel
    if (newStatus === 'cancelled') {
      return user.id === transaction.buyer_id || user.id === transaction.seller_id;
    }

    return false;
  },

  /**
   * Check if user can create review
   */
  canCreateReview: (transaction: { buyer_id: string; seller_id: string; status: string }): boolean => {
    const user = AuthManager.getUser();
    return !!(user && 
      transaction.status === 'delivered' && 
      (user.id === transaction.buyer_id || user.id === transaction.seller_id)
    );
  },

  /**
   * Check if user can access AI assessment
   */
  canUseAIAssessment: (): boolean => {
    return AuthManager.hasRole(['seller', 'admin']);
  },

  /**
   * Check if user can access analytics
   */
  canViewAnalytics: (): boolean => {
    return AuthManager.hasRole(['seller', 'admin']);
  },
};

/**
 * Form validation utilities for auth
 */
export const AuthValidation = {
  /**
   * Validate email format
   */
  validateEmail: (email: string): string | true => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? true : 'Please enter a valid email address';
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): string | true => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return true;
  },

  /**
   * Validate password confirmation
   */
  validatePasswordConfirmation: (password: string, confirmation: string): string | true => {
    if (!confirmation) return 'Password confirmation is required';
    return password === confirmation ? true : 'Passwords do not match';
  },

  /**
   * Validate full name
   */
  validateFullName: (name: string): string | true => {
    if (!name) return 'Full name is required';
    if (name.length < 2) return 'Full name must be at least 2 characters';
    return true;
  },

  /**
   * Validate phone number (Indonesian format)
   */
  validatePhone: (phone: string): string | true => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, '')) ? true : 'Please enter a valid Indonesian phone number';
  },
};

// Export default auth manager
export default AuthManager;