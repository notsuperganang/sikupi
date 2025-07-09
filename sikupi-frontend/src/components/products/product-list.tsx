// FILE: src/components/products/product-list.tsx
"use client";

import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package } from "lucide-react";
import type { Product } from "@/lib/types/product";

interface ProductListProps {
  products?: Product[];
  isLoading?: boolean;
  error?: Error | null;
  variant?: 'buyer' | 'seller'; // DITAMBAHKAN: Prop untuk varian
  className?: string;
}

export function ProductList({ 
  products = [], 
  isLoading, 
  error, 
  variant = 'buyer', // Default ke 'buyer'
  className 
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-md mx-auto">
        <Package className="h-4 w-4" />
        <AlertDescription>
          Terjadi kesalahan saat memuat produk: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!products || products.length === 0) {
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

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        // DIUBAH: Mengoper prop variant ke ProductCard
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
