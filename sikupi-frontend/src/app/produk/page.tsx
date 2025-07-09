import { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductListPage } from "@/components/products/product-list-page";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Produk Ampas Kopi - Sikupi",
  description: "Jelajahi berbagai produk ampas kopi berkualitas tinggi dari mitra terpercaya. Temukan pupuk organik, kompos, dan bahan kerajinan dari ampas kopi.",
  keywords: ["ampas kopi", "pupuk organik", "kompos", "kerajinan", "bahan baku", "sustainable"],
};

function LoadingFallback() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <ProductListPage />
      </Suspense>
    </MainLayout>
  );
}