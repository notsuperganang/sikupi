import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/common/hero-section";
import { FeaturedProducts } from "@/components/products/featured-products";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      
      {/* Featured Products Section */}
      <section className="py-20">
        <div className="container-custom">
          <FeaturedProducts />
        </div>
      </section>
    </MainLayout>
  );
}
