// FILE: src/components/cart/checkout-page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, MapPin, Truck, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/hooks/use-cart";
import { useCreateOrder } from "@/lib/hooks/use-orders";
import { formatCurrency } from "@/lib/utils";

export function CheckoutPage() {
  const router = useRouter();
  const { data: cartData, isLoading } = useCart();
  const createOrder = useCreateOrder();

  const [shippingData, setShippingData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [shippingMethod, setShippingMethod] = useState("jne_regular");

  const cart = cartData?.cart;
  const items = cart?.items || [];

  const subtotal = cart?.totalPrice || 0;
  const adminFee = 5000;
  const shippingCost = 15000;
  const total = subtotal + adminFee + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) return;

    try {
      // For demo purposes, we'll create an order for the first item
      const firstItem = items[0];
      
      await createOrder.mutateAsync({
        productId: firstItem.productId,
        quantity: firstItem.quantity,
        buyerId: "user-002", // Demo buyer ID
        paymentMethod: paymentMethod as any,
        shippingMethod,
        shippingCost,
        shippingAddress: `${shippingData.address}, ${shippingData.city}, ${shippingData.province} ${shippingData.postalCode}`,
        notes: shippingData.notes,
      });

      router.push('/dashboard/pesanan');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Keranjang Kosong
          </h2>
          <p className="text-gray-600 mb-6">
            Tidak ada produk untuk di-checkout
          </p>
          <Button onClick={() => router.push('/produk')}>
            Kembali Belanja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Informasi Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={shippingData.address}
                      onChange={handleInputChange}
                      placeholder="Masukkan alamat lengkap"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Kota</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Provinsi</Label>
                      <Select
                        value={shippingData.province}
                        onValueChange={(value) => setShippingData(prev => ({ ...prev, province: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jawa-barat">Jawa Barat</SelectItem>
                          <SelectItem value="jawa-tengah">Jawa Tengah</SelectItem>
                          <SelectItem value="jawa-timur">Jawa Timur</SelectItem>
                          <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                          <SelectItem value="aceh">Aceh</SelectItem>
                          <SelectItem value="sumatera-utara">Sumatera Utara</SelectItem>
                          <SelectItem value="sulawesi-selatan">Sulawesi Selatan</SelectItem>
                          <SelectItem value="bali">Bali</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Kode Pos</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={shippingData.notes}
                      onChange={handleInputChange}
                      placeholder="Catatan untuk penjual"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Metode Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded">
                      <RadioGroupItem value="jne_regular" id="jne_regular" />
                      <Label htmlFor="jne_regular" className="flex-1">
                        <div className="flex justify-between">
                          <span>JNE Regular</span>
                          <span className="font-medium">{formatCurrency(15000)}</span>
                        </div>
                        <p className="text-sm text-gray-600">Estimasi 2-3 hari kerja</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded">
                      <RadioGroupItem value="sicepat_regular" id="sicepat_regular" />
                      <Label htmlFor="sicepat_regular" className="flex-1">
                        <div className="flex justify-between">
                          <span>SiCepat Regular</span>
                          <span className="font-medium">{formatCurrency(12000)}</span>
                        </div>
                        <p className="text-sm text-gray-600">Estimasi 2-4 hari kerja</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1">
                        <span>Transfer Bank</span>
                        <p className="text-sm text-gray-600">BCA, BNI, BRI, Mandiri</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded">
                      <RadioGroupItem value="e_wallet" id="e_wallet" />
                      <Label htmlFor="e_wallet" className="flex-1">
                        <span>E-Wallet</span>
                        <p className="text-sm text-gray-600">OVO, GoPay, DANA</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded opacity-50">
                      <RadioGroupItem value="cod" id="cod" disabled />
                      <Label htmlFor="cod" className="flex-1">
                        <span>COD (Bayar di Tempat)</span>
                        <p className="text-sm text-gray-600">Tidak tersedia untuk produk ini</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={item.product?.images?.[0] || "/placeholder.png"}
                            alt={item.product?.title || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {item.product?.title}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {item.quantity} kg × {formatCurrency(item.pricePerKg)}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ongkir</span>
                      <span>{formatCurrency(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Biaya Admin</span>
                      <span>{formatCurrency(adminFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? "Memproses..." : "Buat Pesanan"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Dengan menekan tombol "Buat Pesanan", Anda menyetujui{" "}
                    <a href="#" className="text-green-600 hover:underline">
                      Syarat & Ketentuan
                    </a>{" "}
                    kami.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}