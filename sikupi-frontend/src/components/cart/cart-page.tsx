"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Container } from "@/components/common/container";
import { CartItemComponent } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { useCartStore } from "@/stores/cart-store";
import { useRouter } from "next/navigation";

export function CartPage() {
  const router = useRouter();
  const { items, summary, clearCart, syncCart } = useCartStore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked);
    if (checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      setIsSelectAll(false);
    }
  };

  const handleRemoveSelected = () => {
    // This would need to be implemented in the cart store
    // For now, we'll just clear the selection
    setSelectedItems([]);
    setIsSelectAll(false);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  const handleSyncCart = () => {
    syncCart();
  };

  if (items.length === 0) {
    return (
      <div className="py-8">
        <Container>
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/produk">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Produk
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="bg-muted rounded-full p-8 w-fit mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Keranjang Kosong</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Belum ada produk di keranjang Anda. Jelajahi produk ampas kopi berkualitas dan mulai berbelanja sekarang.
            </p>
            <Button asChild size="lg">
              <Link href="/produk">
                Mulai Belanja
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/produk">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Lanjut Belanja
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
            <Button variant="outline" size="sm" onClick={handleSyncCart}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bulk Actions */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isSelectAll}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  Pilih Semua ({items.length} item)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveSelected}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Terpilih ({selectedItems.length})
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Kosongkan Keranjang
                </Button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="pt-4">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                    />
                  </div>
                  <div className="flex-1">
                    <CartItemComponent
                      item={item}
                      variant="default"
                      showRemove={true}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Products */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-4">
                Mungkin Anda Juga Suka
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* This would be populated with recommended products */}
                <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                  Rekomendasi produk akan muncul di sini
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CartSummary 
                variant="default"
                showCheckout={true}
                onCheckout={handleCheckout}
              />
              
              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">
                  Belanja Aman & Terpercaya
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Pembayaran 100% aman</li>
                  <li>• Garansi uang kembali</li>
                  <li>• Produk berkualitas terjamin</li>
                  <li>• Customer service 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}