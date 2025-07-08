import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Star, ShoppingCart, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { useProductStore, type Product } from "@/stores/product-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showAddToCart?: boolean;
  className?: string;
}

const GRADE_COLORS = {
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  C: "bg-red-100 text-red-800 border-red-200",
};

const GRADE_LABELS = {
  A: "Grade A - Sangat Baik",
  B: "Grade B - Baik",
  C: "Grade C - Cukup",
};

export function ProductCard({ 
  product, 
  variant = "default", 
  showAddToCart = true,
  className 
}: ProductCardProps) {
  const { addItem, isInCart } = useCartStore();
  const { toggleFavorite } = useProductStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        weight: product.weight,
        image: product.images[0],
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        location: product.location,
        grade: product.grade,
        stock: product.stock,
      });

      toast.success("Produk ditambahkan ke keranjang", {
        description: product.title,
      });
    } catch (error) {
      toast.error("Gagal menambahkan ke keranjang");
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleFavorite(product.id);
    
    toast.success(
      product.isFavorite ? "Dihapus dari favorit" : "Ditambahkan ke favorit",
      { description: product.title }
    );
  };

  const cardContent = (
    <Card className={cn(
      "group hover:shadow-medium transition-all duration-300 overflow-hidden",
      variant === "featured" && "border-primary/20",
      className
    )}>
      <div className="relative">
        {/* Product Image */}
        <div className={cn(
          "relative overflow-hidden bg-muted",
          variant === "compact" ? "h-32" : "h-48 sm:h-56"
        )}>
          <Image
            src={product.images[0] || "/placeholder-product.jpg"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {/* Favorite button */}
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={cn(
                  "h-4 w-4",
                  product.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )}
              />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount && (
              <Badge variant="destructive" className="text-xs">
                -{product.discount}%
              </Badge>
            )}
            
            {product.isVerified && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                <Verified className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white text-black">
                Stok Habis
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Grade and Category */}
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", GRADE_COLORS[product.grade])}
              title={GRADE_LABELS[product.grade]}
            >
              Grade {product.grade}
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <h3 className={cn(
            "font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors",
            variant === "compact" ? "text-sm" : "text-base"
          )}>
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className={cn(
              "font-bold text-primary",
              variant === "compact" ? "text-base" : "text-lg"
            )}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">/kg</span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground line-clamp-1">
                {product.location}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{product.sellerName}</span>
              {product.isVerified && (
                <Verified className="h-4 w-4 text-blue-500" />
              )}
            </div>
            
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Stock info */}
          {variant !== "compact" && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Stok: {product.stock} kg</span>
              <span>Min. order: {product.minOrder || 1} kg</span>
            </div>
          )}

          {/* Add to Cart Button */}
          {showAddToCart && product.stock > 0 && (
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size={variant === "compact" ? "sm" : "default"}
              disabled={isInCart(product.id)}
            >
              {isInCart(product.id) ? (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Sudah di Keranjang
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Tambah ke Keranjang
                </>
              )}
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );

  return (
    <Link href={`/produk/${product.id}`} className="block">
      {cardContent}
    </Link>
  );
}