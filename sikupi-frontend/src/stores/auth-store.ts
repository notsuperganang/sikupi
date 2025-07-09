// FILE PATH: /sikupi-frontend/src/stores/auth-store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type LoginRequest, type RegisterRequest } from "@/lib/api/services/auth";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: "seller" | "buyer" | "admin";
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessName?: string;
  businessType?: string;
  avatarUrl?: string;
  isVerified: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
  initialize: () => Promise<void>;
  
  // Password reset
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  // Email verification
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      // Basic setters
      setUser: (user) => 
        set({ user, isAuthenticated: true }),

      setTokens: (token, refreshToken) => 
        set({ token, refreshToken }),

      // Initialize auth state on app start
      initialize: async () => {
        const { token, user } = get();
        
        if (token && user) {
          // Verify token is still valid by checking profile
          try {
            await get().checkAuth();
          } catch (error) {
            // If token is invalid, clear auth state
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
            });
          }
        }
        
        set({ isInitialized: true });
      },

      // Login
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login({ email, password });
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem("sikupi_remember_me", "true");
          } else {
            localStorage.removeItem("sikupi_remember_me");
          }

          toast.success("Login berhasil!", {
            description: `Selamat datang, ${response.user.fullName}!`,
          });
        } catch (error: any) {
          const errorMessage = error.message || "Login gagal";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Login gagal", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(userData);
          
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success("Registrasi berhasil!", {
            description: `Selamat datang di Sikupi, ${response.user.fullName}!`,
          });
          
          // Send welcome notification if email not verified
          if (!response.user.emailVerified) {
            toast.info("Verifikasi Email", {
              description: "Silakan cek email Anda untuk verifikasi akun.",
            });
          }
        } catch (error: any) {
          const errorMessage = error.message || "Registrasi gagal";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Registrasi gagal", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Call logout API to invalidate tokens on server
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error("Logout API call failed:", error);
        } finally {
          // Clear all auth data
          localStorage.removeItem("sikupi_remember_me");
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          toast.success("Logout berhasil", {
            description: "Anda telah berhasil keluar dari akun.",
          });
        }
      },

      // Update profile
      updateProfile: async (userData) => {
        const { user } = get();
        if (!user) throw new Error("User not authenticated");

        set({ isLoading: true, error: null });
        
        try {
          // Include user type for business field validation
          const updateData = {
            ...userData,
            userType: user.userType,
          };
          
          const response = await authService.updateProfile(updateData);
          
          set({
            user: response.user,
            isLoading: false,
            error: null,
          });

          toast.success("Profil berhasil diperbarui", {
            description: "Perubahan profil Anda telah disimpan.",
          });
        } catch (error: any) {
          const errorMessage = error.message || "Update profil gagal";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Update profil gagal", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Upload profile image
      uploadProfileImage: async (file: File) => {
        const { user } = get();
        if (!user) throw new Error("User not authenticated");

        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.uploadProfileImage(file);
          
          set({
            user: { ...user, avatarUrl: response.avatarUrl },
            isLoading: false,
            error: null,
          });

          toast.success("Foto profil berhasil diperbarui");
        } catch (error: any) {
          const errorMessage = error.message || "Upload foto gagal";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Upload foto gagal", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Change password
      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.changePassword({ currentPassword, newPassword });
          
          set({
            isLoading: false,
            error: null,
          });

          toast.success("Password berhasil diubah", {
            description: "Password Anda telah diperbarui.",
          });
        } catch (error: any) {
          const errorMessage = error.message || "Gagal mengubah password";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Gagal mengubah password", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Refresh tokens
      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error("No refresh token available");

        try {
          const response = await authService.refreshToken({ refreshToken });
          
          set({
            token: response.token,
            refreshToken: response.refreshToken || refreshToken,
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      // Check auth status
      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await authService.getProfile();
          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          // If profile check fails, clear auth state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Forgot password
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.forgotPassword({ email });
          
          set({ isLoading: false });
          
          toast.success("Email reset password terkirim", {
            description: "Silakan cek email Anda untuk link reset password.",
          });
        } catch (error: any) {
          const errorMessage = error.message || "Gagal mengirim email reset";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Gagal mengirim email reset", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Reset password
      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.resetPassword({ token, newPassword });
          
          set({ isLoading: false });
          
          toast.success("Password berhasil direset", {
            description: "Silakan login dengan password baru Anda.",
          });
        } catch (error: any) {
          const errorMessage = error.message || "Gagal reset password";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Gagal reset password", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Verify email
      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.verifyEmail(token);
          
          // Update user verification status
          const { user } = get();
          if (user) {
            set({
              user: { ...user, emailVerified: true, isVerified: true },
              isLoading: false,
            });
          }
          
          toast.success("Email berhasil diverifikasi", {
            description: "Akun Anda telah diverifikasi.",
          });
        } catch (error: any) {
          const errorMessage = error.message || "Verifikasi email gagal";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Verifikasi email gagal", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Resend verification email
      resendVerification: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.resendVerification();
          
          set({ isLoading: false });
          
          toast.success("Email verifikasi terkirim", {
            description: "Silakan cek email Anda.",
          });
        } catch (error: any) {
          const errorMessage = error.message || "Gagal mengirim ulang verifikasi";
          set({
            error: errorMessage,
            isLoading: false,
          });
          
          toast.error("Gagal mengirim ulang verifikasi", {
            description: errorMessage,
          });
          
          throw error;
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "sikupi-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook for easy access to auth status
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    initialize,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    initialize,
    
    // Computed values
    isGuest: !isAuthenticated,
    isSeller: user?.userType === "seller",
    isBuyer: user?.userType === "buyer",
    isAdmin: user?.userType === "admin",
    isVerified: user?.isVerified || false,
  };
};