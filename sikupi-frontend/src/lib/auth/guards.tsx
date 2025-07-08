"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "seller" | "buyer" | "admin";
  fallbackPath?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole,
  fallbackPath = "/masuk" 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check auth status on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login if auth required but not authenticated
        router.replace(fallbackPath);
        return;
      }

      if (!requireAuth && isAuthenticated) {
        // Redirect to dashboard if trying to access guest pages while authenticated
        router.replace("/dashboard");
        return;
      }

      if (requiredRole && user && user.userType !== requiredRole) {
        // Redirect if user doesn't have required role
        router.replace("/dashboard");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireAuth, requiredRole, router, fallbackPath]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  if (requiredRole && user && user.userType !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requiredRole?: "seller" | "buyer" | "admin";
    fallbackPath?: string;
  } = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for checking permissions
export function usePermissions() {
  const { user, isAuthenticated } = useAuthStore();

  return {
    isAuthenticated,
    user,
    isSeller: user?.userType === "seller",
    isBuyer: user?.userType === "buyer",
    isAdmin: user?.userType === "admin",
    hasRole: (role: "seller" | "buyer" | "admin") => user?.userType === role,
    canAccess: (requiredRole?: "seller" | "buyer" | "admin") => {
      if (!requiredRole) return isAuthenticated;
      return isAuthenticated && user?.userType === requiredRole;
    },
  };
}