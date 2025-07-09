"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star, ShoppingCart, Eye, Edit, Trash2 } from "lucide-react";
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
  variant?: 'buyer' | 'seller'; // DITAMBAHKAN: Varian untuk membedakan tampilan
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
    // DIPERBAIKI: Layout flexbox untuk tombol dan kuantitas
    <div className="flex items-center w-full gap-2">
      <div className="flex items-center gap-1.5">
        <label htmlFor={`qty-${product.id}`} className="text-sm text-muted-foreground">Qty:</label>
        <select
          id={`qty-${product.id}`}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="text-sm border rounded-md px-2 py-1 focus:ring-primary focus:border-primary"
        >
          {[...Array(Math.min(10, product.quantityKg))].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      
      <Button 
        size="sm" 
        onClick={handleAddToCart}
        disabled={addToCart.isPending}
        className="flex-1" // Tombol akan mengisi sisa ruang
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
    // Tambahkan logika untuk hapus produk di sini
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
    <Card className={`group flex flex-col hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <Link href={`/produk/${product.id}`} className="flex flex-col flex-grow">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-8 w-8 ${isFavorite ? "text-red-500" : "text-gray-400"} hover:text-red-500 bg-white/80 backdrop-blur-sm`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant="secondary" className="text-xs">
              {wasteTypeLabels[product.wasteType as keyof typeof wasteTypeLabels]}
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/80">
              Grade {product.grade}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-grow">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-bold text-primary">
              {formatCurrency(product.pricePerKg)}
              <span className="text-sm text-muted-foreground font-normal">/kg</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {categoryLabels[product.category as keyof typeof categoryLabels]}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>Tersedia: {product.quantityKg} kg</span>
            <span className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {product.sellerRating}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{product.location}</span>
          </div>
        </CardContent>
      </Link>

      {/* DIUBAH: Menampilkan aksi berdasarkan varian */}
      <CardFooter className="p-4 pt-0 mt-auto">
        {variant === 'seller' ? <SellerActions product={product} /> : <BuyerActions product={product} />}
      </CardFooter>
    </Card>
  );
}
