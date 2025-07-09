// FILE PATH: /sikupi-frontend/src/lib/auth/guards.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

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
  allowUnverified = true
}: AuthGuardProps) {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    checkAuth, 
    initialize 
  } = useAuthStore();
  
  const [isChecking, setIsChecking] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!isInitialized) {
        await initialize();
      }
      
      // Double-check auth status if we have a token
      if (isAuthenticated) {
        try {
          await checkAuth();
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
      
      setIsChecking(false);
    };

    initAuth();
  }, [isInitialized, isAuthenticated, checkAuth, initialize]);

  // Handle redirects based on auth state
  useEffect(() => {
    if (isChecking || isLoading) return;

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const loginUrl = `${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`;
      router.replace(loginUrl);
      return;
    }

    // If auth is not required but user is authenticated (for login/register pages)
    if (!requireAuth && isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect') || "/dashboard";
      router.replace(redirectPath);
      return;
    }

    // Check role-based access
    if (requireAuth && isAuthenticated && requiredRole) {
      if (!user) {
        router.replace(fallbackPath);
        return;
      }

      if (user.userType !== requiredRole) {
        // Redirect based on user type
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
    isLoading,
    isAuthenticated,
    user,
    requireAuth,
    requiredRole,
    allowUnverified,
    router,
    fallbackPath
  ]);

  // Show loading state while checking auth
  if (isChecking || isLoading || !isInitialized) {
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

// Hook for checking permissions
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
      if (!requiredRole) return isAuthenticated;
      return isAuthenticated && user?.userType === requiredRole;
    },
    canAccessSellerFeatures: () => {
      return isAuthenticated && (user?.userType === "seller" || user?.userType === "admin");
    },
    canAccessAdminFeatures: () => {
      return isAuthenticated && user?.userType === "admin";
    },
  };
}

// Hook for redirecting based on user type
export function useAuthRedirect() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const redirectToDashboard = () => {
    if (!isAuthenticated || !user) {
      router.push("/masuk");
      return;
    }

    switch (user.userType) {
      case "admin":
        router.push("/admin");
        break;
      case "seller":
      case "buyer":
      default:
        router.push("/dashboard");
        break;
    }
  };

  const redirectToLogin = (redirectPath?: string) => {
    const loginUrl = redirectPath 
      ? `/masuk?redirect=${encodeURIComponent(redirectPath)}`
      : "/masuk";
    router.push(loginUrl);
  };

  return {
    redirectToDashboard,
    redirectToLogin,
  };
}

// Component for requiring specific roles
interface RequireRoleProps {
  role: "seller" | "buyer" | "admin";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ role, children, fallback }: RequireRoleProps) {
  const { hasRole } = usePermissions();

  if (!hasRole(role)) {
    return fallback || (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-muted-foreground">
          Access Denied
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          You don't have permission to access this feature.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Component for requiring email verification
interface RequireVerificationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireVerification({ children, fallback }: RequireVerificationProps) {
  const { isEmailVerified } = usePermissions();

  if (!isEmailVerified) {
    return fallback || (
      <div className="text-center py-8 space-y-4">
        <h3 className="text-lg font-medium">Email Verification Required</h3>
        <p className="text-sm text-muted-foreground">
          Please verify your email address to access this feature.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Guest only component (for login/register pages)
interface GuestOnlyProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestOnly({ children, redirectTo = "/dashboard" }: GuestOnlyProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Export everything
export default AuthGuard;