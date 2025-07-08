import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Keranjang Belanja - Sikupi",
  description: "Lihat dan kelola produk ampas kopi di keranjang belanja Anda. Lanjutkan ke checkout untuk menyelesaikan pembelian.",
};

export default function CartPageRoute() {
  return (
    <MainLayout>
      <CartPage />
    </MainLayout>
  );
}