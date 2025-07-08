'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Shield, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RouteProtection } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/Card';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string | string[];
  fallbackUrl?: string;
  showLoading?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles,
  fallbackUrl,
  showLoading = true,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      const redirectUrl = fallbackUrl || RouteProtection.getRedirectUrl(pathname);
      router.push(redirectUrl);
      return;
    }

    // Check role requirements
    if (requiredRoles && user) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const hasRequiredRole = roles.includes(user.user_type);
      
      if (!hasRequiredRole) {
        const redirectUrl = fallbackUrl || '/dashboard';
        router.push(redirectUrl);
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRoles, pathname, router, fallbackUrl]);

  // Show loading state
  if (isLoading && showLoading) {
    return <LoadingScreen />;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <UnauthorizedScreen />;
  }

  // Check role authorization
  if (requiredRoles && user) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasRequiredRole = roles.includes(user.user_type);
    
    if (!hasRequiredRole) {
      return <UnauthorizedScreen message="You don't have permission to access this page." />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="elevated" className="p-8 text-center">
          <CardContent className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex justify-center"
            >
              <Loader2 className="w-12 h-12 text-primary-500" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Loading...</h3>
              <p className="text-neutral-600">Please wait while we prepare your dashboard</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Unauthorized Screen Component
function UnauthorizedScreen({ message = "Please log in to access this page." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="elevated" className="p-8 text-center max-w-md">
          <CardContent className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-error-600" />
              </div>
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-neutral-900">Access Restricted</h3>
              <p className="text-neutral-600">{message}</p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <motion.button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go Back
              </motion.button>
              <motion.button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Higher-order component for easy route protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for conditional rendering based on auth state
export function useConditionalRender() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const renderIfAuthenticated = (content: ReactNode) => {
    return isAuthenticated ? content : null;
  };

  const renderIfRole = (roles: string | string[], content: ReactNode) => {
    if (!user) return null;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.user_type) ? content : null;
  };

  const renderIfSeller = (content: ReactNode) => {
    return renderIfRole(['seller', 'admin'], content);
  };

  const renderIfBuyer = (content: ReactNode) => {
    return renderIfRole(['buyer', 'admin'], content);
  };

  const renderIfAdmin = (content: ReactNode) => {
    return renderIfRole('admin', content);
  };

  return {
    renderIfAuthenticated,
    renderIfRole,
    renderIfSeller,
    renderIfBuyer,
    renderIfAdmin,
    isLoading,
    user,
    isAuthenticated,
  };
}