'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { User, LoginCredentials, RegisterCredentials } from '@/types';
import { authApi } from '@/lib/api';
import { AuthManager } from '@/lib/auth';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (passwordData: { current_password: string; new_password: string }) => Promise<void>;
  
  // Utilities
  checkPermission: (permission: string) => boolean;
  isSeller: () => boolean;
  isBuyer: () => boolean;
  isAdmin: () => boolean;
  isVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is already authenticated
        const { isAuthenticated: isAuth, user: savedUser } = AuthManager.initializeAuth();
        
        if (isAuth && savedUser) {
          // Verify token is still valid by fetching user profile
          try {
            const response = await authApi.getProfile();
            if (response.data?.user) {
              setUser(response.data.user);
              // Update stored user data with latest info
              AuthManager.updateUser(response.data.user);
            } else {
              // Invalid response, clear auth
              AuthManager.clearAuth();
              setUser(null);
            }
          } catch (error) {
            // Token is invalid or expired
            console.error('Token validation failed:', error);
            AuthManager.clearAuth();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        AuthManager.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await authApi.login(credentials);
      
      if (response.data) {
        const { user: userData, token, refreshToken } = response.data;
        
        // Save authentication data
        AuthManager.saveAuth(token, refreshToken, userData);
        setUser(userData);
        
        toast.success(`Welcome back, ${userData.full_name}!`);
        
        // Redirect to dashboard or intended page
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
        router.push(redirectUrl || '/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await authApi.register(userData);
      
      if (response.data) {
        const { user: newUser, token, refreshToken } = response.data;
        
        // Save authentication data
        AuthManager.saveAuth(token, refreshToken, newUser);
        setUser(newUser);
        
        toast.success(`Welcome to Sikupi, ${newUser.full_name}!`);
        
        // Redirect to onboarding or dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API (optional, for server-side session cleanup)
      await authApi.logout().catch(() => {
        // Ignore logout API errors, still proceed with local cleanup
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local auth data
      AuthManager.clearAuth();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      const response = await authApi.updateProfile(userData);
      
      if (response.data?.user) {
        const updatedUser = response.data.user;
        AuthManager.updateUser(updatedUser);
        setUser(updatedUser);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData: { current_password: string; new_password: string }) => {
    try {
      setIsLoading(true);
      
      await authApi.changePassword(passwordData);
      toast.success('Password changed successfully');
    } catch (error: any) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Permission checking utilities
  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    
    switch (permission) {
      case 'sell_products':
        return ['seller', 'admin'].includes(user.user_type);
      case 'buy_products':
        return ['buyer', 'admin'].includes(user.user_type);
      case 'admin_access':
        return user.user_type === 'admin';
      case 'ai_assessment':
        return ['seller', 'admin'].includes(user.user_type);
      case 'analytics':
        return ['seller', 'admin'].includes(user.user_type);
      default:
        return false;
    }
  };

  const isSeller = () => AuthManager.isSeller();
  const isBuyer = () => AuthManager.isBuyer();
  const isAdmin = () => AuthManager.isAdmin();
  const isVerified = () => AuthManager.isVerified();

  const value: AuthContextType = {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    changePassword,
    
    // Utilities
    checkPermission,
    isSeller,
    isBuyer,
    isAdmin,
    isVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Hook for checking if user is authenticated (for client-side route protection)
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

// Hook for role-based access control
export function useRequireRole(requiredRoles: string | string[], redirectTo: string = '/') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const hasRequiredRole = roles.includes(user.user_type);
      
      if (!hasRequiredRole) {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, requiredRoles, redirectTo, router]);

  return { user, isLoading };
}

export default AuthContext;