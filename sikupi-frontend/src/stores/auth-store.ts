import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type LoginRequest, type RegisterRequest } from "@/lib/api";
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

  // Actions
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshTokens: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
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

      // Actions
      setUser: (user) => 
        set({ user, isAuthenticated: true }),

      setTokens: (token, refreshToken) => 
        set({ token, refreshToken }),

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

          // Store in localStorage if remember me is checked
          if (rememberMe) {
            localStorage.setItem("sikupi_remember_me", "true");
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

      logout: async () => {
        try {
          // Call logout API to invalidate tokens
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error("Logout API call failed:", error);
        } finally {
          // Clear localStorage
          localStorage.removeItem("sikupi_remember_me");
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });

          toast.success("Logout berhasil", {
            description: "Anda telah berhasil keluar dari akun.",
          });
        }
      },

      updateProfile: async (userData) => {
        const { user } = get();
        if (!user) throw new Error("User not authenticated");

        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.updateProfile(userData);
          
          set({
            user: { ...user, ...response.user },
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

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

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