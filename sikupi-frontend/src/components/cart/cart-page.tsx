// FILE: src/components/cart/cart-page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export function CartPage() {
  const router = useRouter();
  const { data: cartData, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();

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

  const handleClearCart = () => {
    clearCart.mutate();
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>
          
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Keranjang Anda Kosong
            </h2>
            <p className="text-gray-600 mb-6">
              Belum ada produk dalam keranjang Anda
            </p>
            <Button asChild>
              <Link href="/produk">
                Mulai Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Kosongkan Keranjang
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.product?.images?.[0] || "/placeholder.png"}
                        alt={item.product?.title || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.product?.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.product?.description?.substring(0, 100)}...
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.product?.wasteType === "coffee_grounds" ? "Ampas Kopi" :
                           item.product?.wasteType === "coffee_pulp" ? "Pulp Kopi" :
                           item.product?.wasteType === "coffee_husks" ? "Kulit Kopi" :
                           "Chaff Kopi"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Grade {item.product?.grade}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
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
                            {item.quantity} kg
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
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.pricePerKg)}/kg
                          </p>
                          <p className="font-semibold text-lg">
                            {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeCartItem.isPending}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart?.totalItems} item)</span>
                  <span>{formatCurrency(cart?.totalPrice || 0)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Estimasi Ongkir</span>
                  <span className="text-gray-500">Dihitung di checkout</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Biaya Admin</span>
                  <span>{formatCurrency(5000)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency((cart?.totalPrice || 0) + 5000)}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  Lanjutkan ke Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  asChild
                >
                  <Link href="/produk">
                    Lanjutkan Belanja
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}