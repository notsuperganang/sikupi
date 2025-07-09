// FILE: src/app/keranjang/page.tsx
import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Keranjang Belanja - Sikupi",
  description: "Lihat dan kelola produk dalam keranjang belanja Anda",
};

export default function CartPageComponent() {
  return (
    <MainLayout>
      <CartPage />
    </MainLayout>
  );
}