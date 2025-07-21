// FILE: sikupi-frontend/src/components/auth-initializer.tsx
// BUAT file baru ini untuk menginisialisasi auth state

"use client";

import { useEffect } from "react";
import { useAuthInitializer } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

interface AuthInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthInitializer({ 
  children, 
  fallback 
}: AuthInitializerProps) {
  const { data: authData, isLoading, error } = useAuthInitializer();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  // Show loading state while initializing auth
  if (isLoading || !isInitialized) {
    return fallback || <AuthLoadingFallback />;
  }

  // Show error state if initialization failed (optional)
  if (error) {
    console.warn("Auth initialization failed:", error);
    // Still render children, just log the error
  }

  return <>{children}</>;
}

// Default loading component
function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        {/* Sikupi Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-sikupi-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
        </div>
        
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sikupi-600"></div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Memuat Sikupi...</p>
          <p className="text-xs text-gray-500">Menginisialisasi aplikasi</p>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for page content
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="w-full h-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook untuk loading state dengan timeout
export function useAuthInitializerWithTimeout(timeoutMs: number = 10000) {
  const authResult = useAuthInitializer();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  
  useEffect(() => {
    if (!isInitialized && !authResult.isLoading) {
      // Set a timeout to force initialization if it takes too long
      const timeout = setTimeout(() => {
        console.warn("Auth initialization timeout reached");
        useAuthStore.getState().setIsInitialized(true);
      }, timeoutMs);

      return () => clearTimeout(timeout);
    }
  }, [isInitialized, authResult.isLoading, timeoutMs]);

  return {
    ...authResult,
    isInitialized,
  };
}

export default AuthInitializer;