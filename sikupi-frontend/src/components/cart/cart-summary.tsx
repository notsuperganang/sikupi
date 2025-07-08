import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { ShoppingCart, Package, Truck, Receipt, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  variant?: "default" | "compact" | "checkout";
  showCheckout?: boolean;
  onCheckout?: () => void;
  className?: string;
}

export function CartSummary({ 
  variant = "default",
  showCheckout = true,
  onCheckout,
  className 
}: CartSummaryProps) {
  const { summary, items, applyDiscount, isLoading } = useCartStore();
  const [discountCode, setDiscountCode] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setDiscountLoading(true);
    try {
      await applyDiscount(discountCode);
      setDiscountCode("");
    } catch (error) {
      // Error handled in store
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    onCheckout?.();
  };

  if (variant === "compact") {
    return (
      <div className={cn("p-4 bg-muted/30 rounded-lg", className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Total</span>
          <span className="font-bold text-lg text-primary">
            {formatPrice(summary.total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{summary.totalItems} item</span>
          <span>{summary.totalWeight.toFixed(1)} kg</span>
        </div>
        {showCheckout && (
          <Button 
            onClick={handleCheckout}
            className="w-full mt-3"
            disabled={items.length === 0}
          >
            Checkout
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Items Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Items ({summary.totalItems})</span>
          </div>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>

        {/* Weight Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Total Berat</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {summary.totalWeight.toFixed(1)} kg
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Ongkos Kirim</span>
          </div>
          <span className="font-medium">{formatPrice(summary.shippingCost)}</span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between">
          <span className="text-sm">PPN (11%)</span>
          <span className="font-medium">{formatPrice(summary.tax)}</span>
        </div>

        {/* Discount */}
        {summary.discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="text-sm">Diskon</span>
            </div>
            <span className="font-medium">-{formatPrice(summary.discount)}</span>
          </div>
        )}

        {/* Discount Code Input */}
        {variant !== "checkout" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Kode diskon"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleApplyDiscount}
                disabled={!discountCode.trim() || discountLoading}
              >
                {discountLoading ? "..." : "Pakai"}
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total Pembayaran</span>
          <span className="text-primary">{formatPrice(summary.total)}</span>
        </div>

        {/* Checkout Button */}
        {showCheckout && (
          <Button 
            onClick={handleCheckout}
            className="w-full"
            size="lg"
            disabled={items.length === 0 || isLoading}
          >
            {isLoading ? "Memproses..." : `Checkout (${summary.totalItems} item)`}
          </Button>
        )}

        {/* Additional Info */}
        {variant !== "checkout" && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Gratis ongkir untuk pembelian di atas Rp 100.000</p>
            <p>• Estimasi pengiriman 1-3 hari kerja</p>
            <p>• Harga belum termasuk asuransi pengiriman</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}