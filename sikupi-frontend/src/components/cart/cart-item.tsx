import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CartItemProps {
  item: CartItem;
  variant?: "default" | "compact" | "checkout";
  showRemove?: boolean;
  className?: string;
}

const GRADE_COLORS = {
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  C: "bg-red-100 text-red-800 border-red-200",
};

export function CartItemComponent({ 
  item, 
  variant = "default",
  showRemove = true,
  className 
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }

    if (newQuantity > item.stock) {
      toast.error("Kuantitas melebihi stok tersedia");
      return;
    }

    updateQuantity(item.productId, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.productId);
    toast.success("Produk dihapus dari keranjang");
  };

  const subtotal = item.price * item.quantity;
  const totalWeight = item.weight * item.quantity;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3 p-3 border rounded-lg", className)}>
        {/* Product Image */}
        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden">
          <Image
            src={item.image || "/placeholder-product.jpg"}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="outline" 
              className={cn("text-xs", GRADE_COLORS[item.grade])}
            >
              Grade {item.grade}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {item.quantity} kg
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <div className="font-semibold text-sm">{formatPrice(subtotal)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex gap-4 p-4 border rounded-lg bg-card",
      variant === "checkout" && "bg-muted/30",
      className
    )}>
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        <Link href={`/produk/${item.productId}`}>
          <Image
            src={item.image || "/placeholder-product.jpg"}
            alt={item.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Link 
              href={`/produk/${item.productId}`}
              className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {item.title}
            </Link>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={cn("text-xs", GRADE_COLORS[item.grade])}
              >
                Grade {item.grade}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{item.location}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              Penjual: {item.sellerName}
            </div>
          </div>

          {/* Remove Button */}
          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              {formatPrice(item.price)}/kg
            </span>
            <span className="font-bold text-primary">
              {formatPrice(subtotal)}
            </span>
          </div>

          {variant !== "checkout" ? (
            /* Quantity Controls */
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                {totalWeight.toFixed(1)} kg
              </div>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="flex items-center justify-center min-w-12 px-2 text-sm font-medium">
                  {item.quantity}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            /* Checkout View - Read Only */
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {item.quantity} kg
              </div>
              <div className="text-xs text-muted-foreground">
                Berat: {totalWeight.toFixed(1)} kg
              </div>
            </div>
          )}
        </div>

        {/* Stock Warning */}
        {item.quantity >= item.stock && variant !== "checkout" && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Stok tersisa: {item.stock} kg
          </div>
        )}
      </div>
    </div>
  );
}