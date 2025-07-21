// FILE: src/components/products/product-card.tsx
// PERBAIKAN PRODUCTCARD - Rich Information Display

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star, ShoppingCart, Eye, Edit, Trash2, Package, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAddToCart } from "@/lib/hooks/use-cart";
import { useToggleFavorite } from "@/lib/hooks/use-products";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types/product";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: Product;
  variant?: 'buyer' | 'seller';
  className?: string;
}

// Komponen untuk aksi pembeli
const BuyerActions = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate({ productId: product.id, quantity });
  };

  return (
    <div className="flex items-center w-full gap-2">
      <div className="flex items-center gap-1.5">
        <label htmlFor={`qty-${product.id}`} className="text-xs text-muted-foreground">Qty:</label>
        <select
          id={`qty-${product.id}`}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border rounded px-2 py-1 focus:ring-primary focus:border-primary"
        >
          {[...Array(Math.min(10, Math.floor(product.quantityKg)))].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">kg</span>
      </div>
      
      <Button 
        size="sm" 
        onClick={handleAddToCart}
        disabled={addToCart.isPending}
        className="flex-1"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {addToCart.isPending ? "Menambah..." : "Keranjang"}
      </Button>
    </div>
  );
};

// Komponen untuk aksi penjual
const SellerActions = ({ product }: { product: Product }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete product:", product.id);
  };

  return (
    <div className="flex items-center w-full gap-2">
      <Button variant="outline" size="sm" className="flex-1" asChild>
        <Link href={`/dashboard/produk/${product.id}`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="flex-1" onClick={(e) => {e.preventDefault(); e.stopPropagation();}}>
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat diurungkan. Ini akan menghapus produk Anda secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export function ProductCard({ product, variant = 'buyer', className }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toggleFavorite.mutate({ productId: product.id, isFavorited: !isFavorite });
  };

  const wasteTypeLabels = {
    coffee_grounds: "Ampas Kopi",
    coffee_pulp: "Pulp Kopi",
    coffee_husks: "Kulit Kopi",
    coffee_chaff: "Chaff Kopi",
  };

  const categoryLabels = {
    pupuk: "Pupuk",
    kompos: "Kompos",
    kerajinan: "Kerajinan",
    pakan: "Pakan",
  };

  // Safe access untuk images dengan fallback
  const productImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : "/placeholder.png";

  // Get grade - prefer qualityGrade from backend, fallback to grade
  const grade = product.qualityGrade || product.grade;
  
  // Get location - prefer originLocation from backend, fallback to seller city or location
  const location = product.originLocation || product.seller?.city || product.location || "Lokasi tidak tersedia";

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card className={`group flex flex-col hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:shadow-xl ${className}`}>
      <Link href={`/produk/${product.id}`} className="flex flex-col flex-grow">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={productImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Favorite Button for Buyers */}
          {variant === 'buyer' && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 h-8 w-8 backdrop-blur-sm ${isFavorite 
                ? 'text-red-500 hover:text-red-600 bg-white/90' 
                : 'text-gray-600 hover:text-red-500 bg-white/70'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
          
          {/* Stats for Sellers */}
          {variant === 'seller' && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-white/90">
                <Eye className="h-3 w-3 mr-1" />
                {product.viewsCount || 0}
              </Badge>
              <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-white/90">
                <Heart className="h-3 w-3 mr-1" />
                {product.favoritesCount || 0}
              </Badge>
            </div>
          )}

          {/* Status Badge */}
          {product.status !== 'active' && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-xs">
                {product.status === 'sold_out' ? 'Habis' : 'Nonaktif'}
              </Badge>
            </div>
          )}

          {/* Organic & Fair Trade Badges */}
          {(product.organicCertified || product.fairTradeCertified) && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {product.organicCertified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Organik
                </Badge>
              )}
              {product.fairTradeCertified && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  Fair Trade
                </Badge>
              )}
            </div>
          )}
        </div>

        <CardContent className="flex-grow p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-900">
            {product.title}
          </h3>

          {/* Type, Grade & Category */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs bg-primary">
              {wasteTypeLabels[product.wasteType] || product.wasteType}
            </Badge>
            {grade && (
              <Badge variant="outline" className="text-xs border-primary text-primary">
                Grade {grade}
              </Badge>
            )}
            {product.category && (
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[product.category as keyof typeof categoryLabels] || product.category}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(product.pricePerKg)}
              </span>
              <span className="text-sm font-normal text-muted-foreground">/kg</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                <span>Stok: {product.quantityKg} kg</span>
              </div>
              {product.harvestDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(product.harvestDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Seller Info */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 text-primary" />
              <span>{location}</span>
            </div>
            
            {product.seller && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-700">
                  {product.seller.businessName || product.seller.fullName}
                </span>
                {product.seller.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-xs font-medium">{product.seller.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.seller.totalReviews})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Processing Method */}
            {product.processingMethod && (
              <div className="text-xs text-muted-foreground">
                Metode: {product.processingMethod}
              </div>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        {variant === 'buyer' ? (
          <BuyerActions product={product} />
        ) : (
          <SellerActions product={product} />
        )}
      </CardFooter>
    </Card>
  );
}