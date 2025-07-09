// FILE: src/components/products/product-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAddToCart } from "@/lib/hooks/use-cart";
import { useToggleFavorite } from "@/lib/hooks/use-products";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart.mutate({
      productId: product.id,
      quantity: quantity,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsFavorite(!isFavorite);
    toggleFavorite.mutate(product.id);
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

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <Link href={`/produk/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-8 w-8 ${
              isFavorite ? "text-red-500" : "text-gray-400"
            } hover:text-red-500 bg-white/80 backdrop-blur-sm`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant="secondary" className="text-xs">
              {wasteTypeLabels[product.wasteType as keyof typeof wasteTypeLabels]}
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/80">
              Grade {product.grade}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button variant="secondary" size="sm" className="mr-2">
              <Eye className="h-4 w-4 mr-1" />
              Lihat
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Keranjang
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {product.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(product.pricePerKg)}
              <span className="text-sm text-gray-500 font-normal">/kg</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {categoryLabels[product.category as keyof typeof categoryLabels]}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>Tersedia: {product.quantityKg} kg</span>
            <span className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {product.sellerRating}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{product.location}</span>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Qty:</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              {[...Array(Math.min(10, product.quantityKg))].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
            className="flex-1 ml-4"
          >
            {addToCart.isPending ? "Menambah..." : "Tambah ke Keranjang"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
