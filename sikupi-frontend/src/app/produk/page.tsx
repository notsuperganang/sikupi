import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductListPage } from "@/components/products/product-list-page";

export const metadata: Metadata = {
  title: "Produk Ampas Kopi - Sikupi",
  description: "Jelajahi berbagai produk ampas kopi berkualitas tinggi dari mitra terpercaya. Temukan pupuk organik, kompos, dan bahan kerajinan dari ampas kopi.",
  keywords: ["ampas kopi", "pupuk organik", "kompos", "kerajinan", "bahan baku", "sustainable"],
};

export default function ProductsPage() {
  return (
    <MainLayout>
      <ProductListPage />
    </MainLayout>
  );
}