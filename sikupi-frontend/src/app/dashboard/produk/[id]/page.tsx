// FILE: src/app/produk/[id]/page.tsx
"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ProductDetailPage } from "@/components/products/product-detail-page";

export default function ProductDetailPageComponent() {
  return (
    <MainLayout>
      <ProductDetailPage />
    </MainLayout>
  );
}