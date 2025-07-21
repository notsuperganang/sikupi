// FILE: sikupi-frontend/src/app/produk/[id]/page.tsx
// PERBAIKAN ROUTE - Pass productId dengan benar

import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductDetailPage } from "@/components/products/product-detail-page";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // TODO: Fetch product data untuk meta tags di masa depan
  return {
    title: `Detail Produk - Sikupi`,
    description: "Lihat detail lengkap produk ampas kopi berkualitas dari mitra terpercaya.",
    keywords: ["detail produk", "ampas kopi", "pupuk organik", "kompos", "coffee waste"],
  };
}

export default function ProductDetailPageRoute({ params }: ProductPageProps) {
  // DEBUG: Log params untuk memastikan id ter-pass dengan benar
  console.log('ProductDetailPageRoute - params:', params);
  
  return (
    <MainLayout>
      <ProductDetailPage productId={params.id} />
    </MainLayout>
  );
}