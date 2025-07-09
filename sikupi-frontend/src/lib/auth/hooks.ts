// FILE: src/lib/auth/hooks.ts
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

// Hook to initialize auth state
export function useAuthInitialize() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return { isInitialized };
}

// Hook to get auth state
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isInitialized,
    isChecking: isLoading,
  };
}

// Hook to check if user has specific role
export function useRole(requiredRole?: "seller" | "buyer" | "admin") {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return false;
  }

  if (!requiredRole) {
    return true;
  }

  return user.userType === requiredRole;
}

// Hook to check permissions
export function usePermissions() {
  const { user, isAuthenticated } = useAuthStore();

  return {
    isAuthenticated,
    user,
    isSeller: user?.userType === "seller",
    isBuyer: user?.userType === "buyer",
    isAdmin: user?.userType === "admin",
    isVerified: user?.isVerified || false,
    isEmailVerified: user?.emailVerified || false,
    hasRole: (role: "seller" | "buyer" | "admin") => user?.userType === role,
    canAccess: (requiredRole?: "seller" | "buyer" | "admin") => {
      if (!isAuthenticated || !user) return false;
      if (!requiredRole) return true;
      return user.userType === requiredRole;
    },
  };
}