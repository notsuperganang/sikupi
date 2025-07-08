"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

// Hook for requiring authentication
export function useRequireAuth(redirectTo: string = "/masuk") {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Hook for redirecting authenticated users
export function useRedirectIfAuthenticated(redirectTo: string = "/dashboard") {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Hook for role-based access
export function useRequireRole(
  requiredRole: "seller" | "buyer" | "admin",
  redirectTo: string = "/dashboard"
) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/masuk");
      } else if (user && user.userType !== requiredRole) {
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  return { 
    isAuthenticated, 
    isLoading, 
    hasAccess: user?.userType === requiredRole 
  };
}

// Hook for checking if user can access a resource
export function useCanAccess() {
  const { user, isAuthenticated } = useAuthStore();

  return {
    canAccess: (requiredRole?: "seller" | "buyer" | "admin") => {
      if (!requiredRole) return isAuthenticated;
      return isAuthenticated && user?.userType === requiredRole;
    },
    isSeller: user?.userType === "seller",
    isBuyer: user?.userType === "buyer",
    isAdmin: user?.userType === "admin",
  };
}

// Hook for auto-logout on token expiry
export function useAutoLogout() {
  const { logout, token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    try {
      // Decode JWT to get expiry time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (expiry <= now) {
        // Token is already expired
        logout();
        return;
      }

      // Set timeout to logout when token expires
      const timeoutId = setTimeout(() => {
        logout();
      }, expiry - now);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      // If token parsing fails, logout
      console.error("Error parsing token:", error);
      logout();
    }
  }, [token, logout]);
}