// FILE: src/components/products/featured-products.tsx
"use client";

import { ProductCard } from "./product-card";
import { ProductList } from "./product-list";
import { Button } from "@/components/ui/button";
import { useFeaturedProducts } from "@/lib/hooks/use-products";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export function FeaturedProducts({ 
  title = "Produk Unggulan",
  subtitle = "Produk ampas kopi berkualitas tinggi dengan rating terbaik",
  limit = 8,
  showViewAll = true,
  className 
}: FeaturedProductsProps) {
  const { data, isLoading, error } = useFeaturedProducts(limit);

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600">
              {subtitle}
            </p>
          </div>
          
          {showViewAll && (
            <Button variant="outline" asChild>
              <Link href="/produk" className="flex items-center">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <ProductList 
          products={data?.products || []}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </section>
  );
}
