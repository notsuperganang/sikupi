// FILE: src/components/cart/cart-drawer.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CartDrawerProps {
  children: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const { data: cartData, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const cart = cartData?.cart;
  const items = cart?.items || [];

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    updateCartItem.mutate({
      itemId,
      data: { quantity: newQuantity }
    });
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartItem.mutate(itemId);
  };

  const handleCheckout = () => {
    setOpen(false);
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang Belanja
            {items.length > 0 && (
              <Badge variant="secondary">{items.length}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Produk yang Anda tambahkan ke keranjang
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Keranjang Kosong
            </h3>
            <p className="text-gray-500 mb-4">
              Belum ada produk dalam keranjang Anda
            </p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/produk">Mulai Belanja</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={item.product?.images?.[0] || "/placeholder.png"}
                        alt={item.product?.title || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.pricePerKg)}/kg
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updateCartItem.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateCartItem.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(item.totalPrice)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeCartItem.isPending}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart?.totalItems} item)</span>
                  <span>{formatCurrency(cart?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimasi Ongkir</span>
                  <span>Dihitung di checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(cart?.totalPrice || 0)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                Checkout ({items.length})
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}