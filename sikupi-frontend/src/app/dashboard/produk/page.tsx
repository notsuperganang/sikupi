import { Metadata } from "next";
import { Suspense } from "react";
// DIUBAH: Menggunakan DashboardLayout, bukan MainLayout
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"; 
import { SellerProductPage } from "@/components/dashboard/seller-product-page";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Kelola Produk - Sikupi Dashboard",
  description: "Kelola, tambah, dan edit produk ampas kopi Anda di marketplace Sikupi.",
};

// Komponen ini akan ditampilkan sementara halaman dimuat
function LoadingFallback() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function DashboardProductsPage() {
  return (
    // DIUBAH: Menggunakan DashboardLayout, bukan MainLayout
    <DashboardLayout>
      <Suspense fallback={<LoadingFallback />}>
        <SellerProductPage />
      </Suspense>
    </DashboardLayout>
  );
}
