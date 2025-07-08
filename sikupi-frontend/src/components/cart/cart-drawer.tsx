"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CartItemComponent } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { useCartStore } from "@/stores/cart-store";

interface CartDrawerProps {
  children: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, summary, clearCart } = useCartStore();

  const handleCheckout = () => {
    setIsOpen(false);
    // Navigation will be handled by the checkout page
  };

  const handleClearCart = () => {
    clearCart();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Keranjang Belanja</span>
              {items.length > 0 && (
                <Badge variant="secondary">{items.length}</Badge>
              )}
            </div>
            
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="bg-muted rounded-full p-6 w-fit mx-auto">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Keranjang Kosong</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Belum ada produk di keranjang Anda
                </p>
                <Button asChild onClick={() => setIsOpen(false)}>
                  <Link href="/produk">
                    Mulai Belanja
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Cart Content */
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {items.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  variant="compact"
                  showRemove={true}
                />
              ))}
            </div>

            <Separator className="my-4" />

            {/* Cart Summary */}
            <div className="space-y-4">
              <CartSummary variant="compact" showCheckout={false} />
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/keranjang">
                    Lihat Keranjang
                  </Link>
                </Button>
                
                <Button 
                  className="flex-1"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/checkout">
                    Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {/* Continue Shopping */}
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Lanjut Belanja
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}