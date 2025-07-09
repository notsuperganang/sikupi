// FILE: src/app/checkout/page.tsx
import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { CheckoutPage } from "@/components/cart/checkout-page";

export const metadata: Metadata = {
  title: "Checkout - Sikupi",
  description: "Selesaikan pembelian produk ampas kopi Anda",
};

export default function CheckoutPageComponent() {
  return (
    <MainLayout>
      <CheckoutPage />
    </MainLayout>
  );
}