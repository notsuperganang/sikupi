// FILE: src/lib/hooks/use-auth.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { mockAuthService } from "@/lib/mock/complete-mock-services";
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
    queryFn: () => mockAuthService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    initialData: user ? { user } : undefined,
  });
}

// Login mutation
export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => mockAuthService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      
      toast.success("Login berhasil!", {
        description: `Selamat datang, ${data.user.fullName}`,
      });
      
      // Redirect based on user type
      const redirectPath = data.user.userType === "admin" ? "/admin" : "/dashboard";
      router.push(redirectPath);
    },
    onError: (error: any) => {
      toast.error("Login gagal", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  return useMutation({
    mutationFn: (userData: RegisterRequest) => mockAuthService.register(userData),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      
      toast.success("Registrasi berhasil!", {
        description: `Selamat datang, ${data.user.fullName}`,
      });
      
      // Redirect based on user type
      const redirectPath = data.user.userType === "admin" ? "/admin" : "/dashboard";
      router.push(redirectPath);
    },
    onError: (error: any) => {
      toast.error("Registrasi gagal", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mockAuthService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Logout berhasil");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error("Logout gagal", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: any) => mockAuthService.updateProfile(data),
    onSuccess: (response) => {
      setUser(response.user);
      queryClient.setQueryData(authKeys.profile(), response);
      toast.success("Profil berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui profil", {
        description: error.message || "Silakan coba lagi",
      });
    },
  });
}