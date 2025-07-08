import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { CheckoutPage } from "@/components/cart/checkout-page";

export const metadata: Metadata = {
  title: "Checkout - Sikupi",
  description: "Selesaikan pembelian produk ampas kopi Anda. Isi alamat pengiriman dan pilih metode pembayaran yang sesuai.",
};

export default function CheckoutRoute() {
  return (
    <MainLayout>
      <CheckoutPage />
    </MainLayout>
  );
}