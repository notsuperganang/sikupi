import { Metadata } from "next";
import { Suspense } from "react"; // 1. Tambahkan import Suspense
import { MainLayout } from "@/components/layout/main-layout";
import { ProductListPage } from "@/components/products/product-list-page";
import { Loader2 } from "lucide-react"; // Asumsi Anda memiliki lucide-react

export const metadata: Metadata = {
  // Saya sesuaikan judulnya agar lebih cocok untuk halaman dashboard
  title: "Kelola Produk - Sikupi Dashboard",
  description: "Kelola produk ampas kopi Anda di marketplace Sikupi.",
};

// 2. Buat komponen UI untuk ditampilkan saat loading
function LoadingFallback() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function DashboardProductsPage() {
  return (
    <MainLayout>
      {/* 3. Bungkus komponen yang bermasalah dengan <Suspense> */}
      <Suspense fallback={<LoadingFallback />}>
        <ProductListPage />
      </Suspense>
    </MainLayout>
  );
}
