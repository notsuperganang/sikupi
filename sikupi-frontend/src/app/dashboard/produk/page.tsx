import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SellerProductsPage } from "@/components/dashboard/seller-product-page";

export const metadata: Metadata = {
  title: "Kelola Produk - Dashboard Sikupi",
  description: "Kelola produk ampas kopi Anda. Tambah, edit, dan hapus produk dengan mudah.",
};

export default function SellerProductsPageRoute() {
  return (
    <DashboardLayout>
      <SellerProductsPage />
    </DashboardLayout>
  );
}