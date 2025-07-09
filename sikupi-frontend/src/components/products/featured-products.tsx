// FILE PATH: /sikupi-frontend/src/components/products/featured-products.tsx

"use client";

import Link from "next/link";
import { ArrowRight, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductCard } from "./product-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useFeaturedProducts } from "@/lib/hooks/use-products";

export function FeaturedProducts() {
  const { 
    data: featuredData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useFeaturedProducts(8);

  const products = featuredData?.products || [];

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Produk Terpopuler</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan berbagai produk ampas kopi berkualitas dari mitra terpercaya kami
          </p>
        </div>
        <LoadingSkeleton variant="product-grid" count={4} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Produk Terpopuler</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan berbagai produk ampas kopi berkualitas dari mitra terpercaya kami
          </p>
        </div>
        
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Gagal memuat produk featured. {error instanceof Error ? error.message : 'Terjadi kesalahan.'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div>
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Produk Terpopuler</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan berbagai produk ampas kopi berkualitas dari mitra terpercaya kami
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Belum Ada Produk Featured</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Saat ini belum ada produk featured yang tersedia. Silakan cek kembali nanti atau jelajahi semua produk kami.
          </p>
          <Button asChild>
            <Link href="/produk">
              Lihat Semua Produk
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Success state with products
  return (
    <div>
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold">
          Produk Terpopuler
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Temukan berbagai produk ampas kopi berkualitas dari mitra terpercaya kami
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="default"
          />
        ))}
      </div>

      {/* Show more products if available */}
      {products.length > 4 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.slice(4, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="default"
            />
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="text-center">
        <Button asChild size="lg" className="min-w-48">
          <Link href="/produk">
            Lihat Semua Produk
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        
        {/* Products count indicator */}
        {products.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4">
            Menampilkan {Math.min(8, products.length)} dari {products.length} produk featured
          </p>
        )}
      </div>
    </div>
  );
}