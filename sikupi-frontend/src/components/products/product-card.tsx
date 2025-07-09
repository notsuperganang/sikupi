// FILE PATH: /sikupi-frontend/src/components/products/product-card.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  MapPin, 
  Star, 
  Package, 
  User, 
  Eye,
  ShoppingCart,
  Verified
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Product } from "@/lib/api/services/products";
import { useToggleFavorite } from "@/lib/hooks/use-products";
import { useAuthStore } from "@/stores/auth-store";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showQuickAdd?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  variant = "default",
  showQuickAdd = true,
  className,
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const { isAuthenticated } = useAuthStore();
  const toggleFavoriteMutation = useToggleFavorite();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format weight
  const formatWeight = (kg: number) => {
    return kg >= 1 ? `${kg} kg` : `${kg * 1000} g`;
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get waste type label
  const getWasteTypeLabel = (wasteType: string) => {
    switch (wasteType) {
      case 'coffee_grounds':
        return 'Ampas Kopi';
      case 'coffee_pulp':
        return 'Pulp Kopi';
      case 'coffee_husks':
        return 'Kulit Kopi';
      case 'coffee_chaff':
        return 'Sekam Kopi';
      default:
        return wasteType;
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    
    toggleFavoriteMutation.mutate(product.id);
  };

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    
    // TODO: Add to cart logic
    console.log('Add to cart:', product.id);
  };

  // Get card dimensions based on variant
  const getCardClasses = () => {
    switch (variant) {
      case "compact":
        return "w-full max-w-[200px]";
      case "featured":
        return "w-full";
      default:
        return "w-full";
    }
  };

  // Get image dimensions based on variant
  const getImageClasses = () => {
    switch (variant) {
      case "compact":
        return "h-32";
      case "featured":
        return "h-56";
      default:
        return "h-48";
    }
  };

  const primaryImage = product.imageUrls?.[0] || '/placeholder-product.jpg';

  return (
    <Card className={cn(getCardClasses(), "group hover:shadow-lg transition-all duration-200", className)}>
      <Link href={`/produk/${product.id}`}>
        <div className="relative overflow-hidden rounded-t-lg">
          {/* Product Image */}
          <div className={cn("relative bg-gray-100", getImageClasses())}>
            {!imageError ? (
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                className={cn(
                  "object-cover transition-all duration-300 group-hover:scale-105",
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Loading skeleton */}
            {imageLoading && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </div>

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Grade badge */}
            <Badge className={cn("text-xs font-medium", getGradeColor(product.qualityGrade))}>
              Grade {product.qualityGrade}
            </Badge>
            
            {/* Organic certified badge */}
            {product.organicCertified && (
              <Badge className="bg-green-600 text-white text-xs">
                Organik
              </Badge>
            )}
            
            {/* Fair trade badge */}
            {product.fairTradeCertified && (
              <Badge className="bg-blue-600 text-white text-xs">
                Fair Trade
              </Badge>
            )}
          </div>

          {/* Favorite button */}
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={handleFavoriteToggle}
              disabled={toggleFavoriteMutation.isPending}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-colors",
                  // product.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  "text-gray-600" // TODO: Add isFavorite to Product type
                )}
              />
            </Button>
          </div>

          {/* Status indicators */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {!product.isAvailable && (
              <Badge variant="destructive" className="text-xs">
                Habis
              </Badge>
            )}
            
            {product.status === 'inactive' && (
              <Badge variant="secondary" className="text-xs">
                Tidak Aktif
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Product title */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Waste type */}
          <p className="text-xs text-muted-foreground mb-2">
            {getWasteTypeLabel(product.wasteType)}
          </p>

          {/* Price and quantity */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(product.pricePerKg)}
              </p>
              <p className="text-xs text-muted-foreground">
                per kg • {formatWeight(product.quantityKg)} tersedia
              </p>
            </div>
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate flex items-center gap-1">
                {product.sellerName}
                {product.sellerVerified && (
                  <Verified className="w-3 h-3 text-blue-500" />
                )}
              </p>
              {product.sellerRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {product.sellerRating.toFixed(1)} ({product.sellerReviewCount || 0})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {product.originLocation}
            </span>
          </div>

          {/* Stats */}
          {variant !== "compact" && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{product.viewsCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{product.favoritesCount || 0}</span>
              </div>
            </div>
          )}
        </CardContent>

        {/* Quick add to cart */}
        {showQuickAdd && variant !== "compact" && (
          <CardFooter className="p-4 pt-0">
            <Button
              className="w-full"
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.isAvailable ? "Tambah ke Keranjang" : "Tidak Tersedia"}
            </Button>
          </CardFooter>
        )}
      </Link>
    </Card>
  );
}