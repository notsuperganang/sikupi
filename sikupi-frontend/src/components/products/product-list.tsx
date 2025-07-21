// FILE: src/components/products/product-list.tsx
// CLEAN VERSION - Remove debug UI, keep console logging

"use client";

import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package } from "lucide-react";
import type { Product } from "@/lib/types/product";

interface ProductListProps {
  products?: Product[];
  isLoading?: boolean;
  error?: Error | string | null;
  variant?: 'buyer' | 'seller';
  className?: string;
}

export function ProductList({ 
  products = [], 
  isLoading, 
  error, 
  variant = 'buyer',
  className 
}: ProductListProps) {
  // DEBUG: Log props untuk debugging (console only)
  console.log('ProductList props:', {
    productsCount: products?.length || 0,
    isLoading,
    error: error || null,
    variant,
    hasProducts: !!products && products.length > 0
  });

  // DEBUG: Log sample product jika ada (console only)
  if (products && products.length > 0) {
    console.log('ProductList - Sample product:', products[0]);
  }

  if (isLoading) {
    console.log('ProductList: Rendering loading state');
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('ProductList: Rendering error state:', error);
    // Handle both Error object and string
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return (
      <Alert className="max-w-md mx-auto">
        <Package className="h-4 w-4" />
        <AlertDescription>
          Terjadi kesalahan saat memuat produk: {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  if (!products || products.length === 0) {
    console.warn('ProductList: No products to display');
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tidak ada produk ditemukan
        </h3>
        <p className="text-gray-500">
          Coba ubah filter pencarian atau kata kunci Anda
        </p>
      </div>
    );
  }

  console.log(`ProductList: Rendering ${products.length} products`);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product, index) => {
        // DEBUG: Log setiap product yang akan dirender (console only)
        if (process.env.NODE_ENV === 'development' && index < 2) {
          console.log(`Rendering product ${index + 1}:`, {
            id: product.id,
            title: product.title,
            pricePerKg: product.pricePerKg,
            images: product.images
          });
        }
        
        return (
          <ProductCard 
            key={product.id} 
            product={product} 
            variant={variant} 
          />
        );
      })}
    </div>
  );
}