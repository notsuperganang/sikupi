// FILE: src/lib/auth/guards.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "seller" | "buyer" | "admin";
  fallbackPath?: string;
  allowUnverified?: boolean;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  fallbackPath = "/masuk",
  allowUnverified = false,
}: AuthGuardProps) {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    initialize 
  } = useAuthStore();

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  const isChecking = isLoading || !isInitialized;

  useEffect(() => {
    if (isChecking) return;

    // Redirect to login if auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.replace(fallbackPath);
      return;
    }

    // Redirect to dashboard if user is already authenticated and trying to access auth pages
    if (!requireAuth && isAuthenticated) {
      const redirectPath = user?.userType === "admin" ? "/admin" : "/dashboard";
      router.replace(redirectPath);
      return;
    }

    // Check role requirements
    if (requireAuth && isAuthenticated && requiredRole && user) {
      if (user.userType !== requiredRole) {
        const redirectPath = user.userType === "admin" ? "/admin" : "/dashboard";
        router.replace(redirectPath);
        return;
      }
    }

    // Check email verification if required
    if (requireAuth && isAuthenticated && !allowUnverified && user) {
      if (!user.emailVerified) {
        router.replace("/verify-email");
        return;
      }
    }
  }, [
    isChecking,
    isAuthenticated,
    user,
    requireAuth,
    requiredRole,
    allowUnverified,
    router,
    fallbackPath
  ]);

  // Show loading state while checking auth
  if (isChecking) {
    return <AuthLoadingScreen />;
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  if (requireAuth && isAuthenticated && requiredRole && user?.userType !== requiredRole) {
    return null;
  }

  if (requireAuth && isAuthenticated && !allowUnverified && user && !user.emailVerified) {
    return null;
  }

  return <>{children}</>;
}

// Loading screen component
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Loading...</h3>
          <p className="text-sm text-muted-foreground">
            Preparing your experience
          </p>
        </div>
      </div>
    </div>
  );
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requiredRole?: "seller" | "buyer" | "admin";
    fallbackPath?: string;
    allowUnverified?: boolean;
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