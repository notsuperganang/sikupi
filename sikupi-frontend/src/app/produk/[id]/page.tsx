import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductDetailPage } from "@/components/products/product-detail-page";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // TODO: Fetch product data for meta tags in the future
  return {
    title: `Detail Produk - Sikupi`,
    description: "Lihat detail lengkap produk ampas kopi berkualitas dari mitra terpercaya.",
    keywords: ["detail produk", "ampas kopi", "pupuk organik", "kompos", "coffee waste"],
  };
}

export default function ProductDetailPageRoute({ params }: ProductPageProps) {
  return (
    <MainLayout>
      <ProductDetailPage productId={params.id} />
    </MainLayout>
  );
}