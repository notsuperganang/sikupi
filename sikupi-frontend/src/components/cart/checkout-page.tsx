"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/common/container";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormTextarea } from "@/components/forms/form-textarea";
import { CartItemComponent } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { useCartStore } from "@/stores/cart-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Transfer Bank" },
  { value: "credit_card", label: "Kartu Kredit" },
  { value: "e_wallet", label: "E-Wallet" },
];

export function CheckoutPage() {
  const router = useRouter();
  const { items, summary, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: "",
        phone: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
      },
      paymentMethod: undefined,
      notes: "",
    },
  });

  const watchedPaymentMethod = watch("paymentMethod");

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful order
      clearCart();
      
      toast.success("Pesanan berhasil dibuat!", {
        description: "Kami akan segera memproses pesanan Anda.",
      });
      
      // Redirect to order confirmation or orders page
      router.push("/dashboard/pesanan");
      
    } catch (error) {
      toast.error("Gagal memproses pesanan", {
        description: "Silakan coba lagi atau hubungi customer service.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-8">
        <Container>
          <div className="text-center py-12">
            <div className="bg-muted rounded-full p-8 w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Keranjang Kosong</h2>
            <p className="text-muted-foreground mb-8">
              Tidak ada item untuk checkout. Silakan tambahkan produk ke keranjang terlebih dahulu.
            </p>
            <Button asChild size="lg">
              <Link href="/produk">Mulai Belanja</Link>
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
            <Link href="/keranjang">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Keranjang
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Alamat Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nama Lengkap"
                      required
                      error={errors.shippingAddress?.fullName?.message}
                      {...register("shippingAddress.fullName")}
                    />
                    <FormInput
                      label="Nomor Telepon"
                      type="tel"
                      required
                      error={errors.shippingAddress?.phone?.message}
                      {...register("shippingAddress.phone")}
                    />
                  </div>
                  
                  <FormTextarea
                    label="Alamat Lengkap"
                    required
                    rows={3}
                    error={errors.shippingAddress?.address?.message}
                    {...register("shippingAddress.address")}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Kota"
                      required
                      error={errors.shippingAddress?.city?.message}
                      {...register("shippingAddress.city")}
                    />
                    <FormInput
                      label="Provinsi"
                      required
                      error={errors.shippingAddress?.province?.message}
                      {...register("shippingAddress.province")}
                    />
                    <FormInput
                      label="Kode Pos"
                      required
                      maxLength={5}
                      error={errors.shippingAddress?.postalCode?.message}
                      {...register("shippingAddress.postalCode")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormSelect
                    label="Pilih Metode Pembayaran"
                    required
                    placeholder="Pilih metode pembayaran"
                    options={PAYMENT_METHODS}
                    value={watchedPaymentMethod}
                    onValueChange={(value) => {
                      register("paymentMethod").onChange({
                        target: { value, name: "paymentMethod" }
                      });
                    }}
                    error={errors.paymentMethod?.message}
                  />
                  
                  {watchedPaymentMethod && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        {watchedPaymentMethod === "bank_transfer" && 
                          "Detail rekening bank akan dikirim setelah pesanan dikonfirmasi."}
                        {watchedPaymentMethod === "credit_card" && 
                          "Anda akan diarahkan ke halaman pembayaran yang aman."}
                        {watchedPaymentMethod === "e_wallet" && 
                          "Pilih aplikasi e-wallet yang ingin digunakan pada langkah selanjutnya."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Catatan Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormTextarea
                    label="Catatan untuk penjual (opsional)"
                    placeholder="Tulis catatan khusus untuk pesanan ini..."
                    rows={3}
                    maxLength={500}
                    showCharacterCount
                    error={errors.notes?.message}
                    {...register("notes")}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Items Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pesanan Anda ({items.length} item)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.map((item) => (
                      <CartItemComponent
                        key={item.id}
                        item={item}
                        variant="checkout"
                        showRemove={false}
                      />
                    ))}
                  </CardContent>
                </Card>

                {/* Summary */}
                <CartSummary 
                  variant="checkout"
                  showCheckout={false}
                />

                {/* Checkout Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Memproses..." : `Buat Pesanan - ${summary.total.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}`}
                </Button>

                {/* Terms */}
                <div className="text-xs text-muted-foreground text-center">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <Link href="/syarat" className="text-primary hover:underline">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link href="/privasi" className="text-primary hover:underline">
                    Kebijakan Privasi
                  </Link>{" "}
                  kami.
                </div>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}