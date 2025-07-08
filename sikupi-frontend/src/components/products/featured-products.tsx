"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/product-store";
import { ArrowRight } from "lucide-react";

// Mock data for development - will be replaced with real API
const MOCK_PRODUCTS = [
  {
    id: "1",
    title: "Ampas Kopi Organik Grade A Premium",
    description: "Ampas kopi berkualitas tinggi dari biji arabika organik yang telah disertifikasi. Cocok untuk pupuk organik dan kompos berkualitas tinggi.",
    price: 25000,
    originalPrice: 30000,
    discount: 17,
    stock: 50,
    weight: 1,
    category: "pupuk",
    grade: "A" as const,
    images: ["/ampas-kopi-premium1.png"],
    location: "Jakarta Selatan",
    sellerId: "seller1",
    sellerName: "Kafe Nusantara",
    sellerType: "cafe" as const,
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    isFavorite: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    minOrder: 5,
    processingTime: "1-2 hari kerja"
  },
  {
    id: "2",
    title: "Kompos Ampas Kopi Siap Pakai Grade B Premium",
    description: "Kompos matang dari campuran ampas kopi dan bahan organik lainnya. Sudah difermentasi selama 3 bulan dan siap untuk digunakan.",
    price: 18000,
    stock: 75,
    weight: 1,
    category: "kompos",
    grade: "B" as const,
    images: ["/ampas-kopi2.png"],
    location: "Bandung",
    sellerId: "seller2",
    sellerName: "Hotel Grand Indonesia",
    sellerType: "hotel" as const,
    rating: 4.6,
    reviewCount: 89,
    isVerified: true,
    isFavorite: false,
    createdAt: "2024-01-14T15:30:00Z",
    updatedAt: "2024-01-14T15:30:00Z",
    minOrder: 10,
    processingTime: "Same day"
  },
  {
    id: "3",
    title: "Bahan Baku Kerajinan Ampas Kopi",
    description: "Ampas kopi kering yang telah dibersihkan dan diproses khusus untuk keperluan kerajinan tangan dan craft projects.",
    price: 35000,
    stock: 25,
    weight: 0.5,
    category: "craft",
    grade: "A" as const,
    images: ["/ampas-kopi3.png"],
    location: "Yogyakarta",
    sellerId: "seller3",
    sellerName: "Roastery Jogja",
    sellerType: "roastery" as const,
    rating: 4.9,
    reviewCount: 67,
    isVerified: true,
    isFavorite: true,
    createdAt: "2024-01-13T08:15:00Z",
    updatedAt: "2024-01-13T08:15:00Z",
    minOrder: 2,
    processingTime: "2-3 hari kerja"
  },
  {
    id: "4",
    title: "Ampas Kopi untuk Media Tanam Super",
    description: "Campuran ampas kopi yang sudah dikompos untuk media tanam tanaman hias dan sayuran organik.",
    price: 15000,
    stock: 100,
    weight: 1,
    category: "pupuk",
    grade: "B" as const,
    images: ["/ampas-kopi4.png"],
    location: "Surabaya",
    sellerId: "seller4",
    sellerName: "Restoran Timur",
    sellerType: "restaurant" as const,
    rating: 4.4,
    reviewCount: 156,
    isVerified: false,
    isFavorite: false,
    createdAt: "2024-01-12T12:45:00Z",
    updatedAt: "2024-01-12T12:45:00Z",
    minOrder: 5,
    processingTime: "1-2 hari kerja"
  }
];

export function FeaturedProducts() {
  const { featured, isLoading, setProducts } = useProductStore();

  useEffect(() => {
    // For development, use mock data
    // In production, this would call fetchFeaturedProducts()
    if (featured.length === 0) {
      setProducts(MOCK_PRODUCTS);
    }
  }, [featured.length, setProducts]);

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

  const displayProducts = featured.length > 0 ? featured.slice(0, 4) : MOCK_PRODUCTS;

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
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="default"
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button asChild size="lg" className="min-w-48">
          <Link href="/produk">
            Lihat Semua Produk
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}