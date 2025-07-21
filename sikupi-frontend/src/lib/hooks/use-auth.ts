// FILE: sikupi-frontend/src/lib/hooks/use-auth.ts
// GANTI seluruh content file ini dengan kode berikut:

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/lib/services/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { LoginRequest, RegisterRequest } from "@/lib/types/auth";

// Auth keys for React Query
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  verification: () => [...authKeys.all, "verification"] as const,
};

// Get current user profile
export function useProfile() {
  const { user, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    initialData: user ? { user, success: true } : undefined,
  });
}

// Login mutation
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        
        // Invalidate and refetch auth-related queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
        
        toast.success("Login berhasil!", {
          description: `Selamat datang, ${data.user.fullName}`,
        });
        
        // Redirect based on user type
        const redirectPath = data.user.userType === "admin" ? "/admin" : "/dashboard";
        router.push(redirectPath);
      } else {
        throw new Error(data.message || "Login gagal");
      }
    },
    onError: (error: any) => {
      toast.error("Login gagal", {
        description: error.message || "Email atau password salah",
      });
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        
        // Invalidate and refetch auth-related queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
        
        toast.success("Registrasi berhasil!", {
          description: `Selamat datang, ${data.user.fullName}`,
        });
        
        // Redirect based on user type
        const redirectPath = data.user.userType === "admin" ? "/admin" : "/dashboard";
        router.push(redirectPath);
      } else {
        throw new Error(data.message || "Registrasi gagal");
      }
    },
    onError: (error: any) => {
      toast.error("Registrasi gagal", {
        description: error.message || "Silakan periksa data Anda",
      });
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (userData: any) => authService.updateProfile(userData),
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        
        // Invalidate and refetch auth-related queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
        
        toast.success("Profil berhasil diperbarui");
      }
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui profil", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      authService.changePassword(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Password berhasil diubah");
      }
    },
    onError: (error: any) => {
      toast.error("Gagal mengubah password", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      
      // Clear all cached queries
      queryClient.clear();
      
      toast.success("Logout berhasil");
      router.push("/");
    },
    onError: (error: any) => {
      // Even if API call fails, we still want to clear local auth
      clearAuth();
      queryClient.clear();
      
      console.error("Logout error:", error);
      toast.success("Logout berhasil");
      router.push("/");
    },
  });
}

// Refresh token mutation (usually called automatically)
export function useRefreshToken() {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (data) => {
      if (data.success && data.token) {
        setToken(data.token);
        
        // Invalidate and refetch auth-related queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
    onError: (error: any) => {
      console.error("Token refresh failed:", error);
      // Optionally trigger logout if refresh fails
    },
    retry: 1,
  });
}

// Check if user is authenticated (helper hook)
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
}

// Get user info (helper hook)
export function useUser() {
  const { user } = useAuthStore();
  return user;
}

// Initialize auth on app startup
export function useAuthInitializer() {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setIsInitialized = useAuthStore((state) => state.setIsInitialized);

  return useQuery({
    queryKey: ["auth", "initialize"],
    queryFn: async () => {
      // Check if we have a token in localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("sikupi_token");
        if (token) {
          try {
            // Try to get user profile with stored token
            const { user } = await authService.getProfile();
            setUser(user);
            setToken(token);
            setIsAuthenticated(true);
            return { initialized: true, authenticated: true };
          } catch (error) {
            // Token is invalid, clear it
            localStorage.removeItem("sikupi_token");
            localStorage.removeItem("sikupi_refresh_token");
            console.error("Auth initialization failed:", error);
          }
        }
      }
      
      setIsInitialized(true);
      return { initialized: true, authenticated: false };
    },
    enabled: !isInitialized,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}