import { LandingHero } from "@/components/ui/landing-hero";
import { EcosystemBeamDemo, FeaturesSection } from "@/components/landing";
import { SikupiTracker } from "@/components/landing/SikupiTracker";
import { CoffeeShopCTASection } from "@/components/landing/CoffeeShopCTASection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      
      {/* Smooth Transition */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-amber-50/50 z-10"></div>
        <EcosystemBeamDemo />
      </div>
      
      <FeaturesSection />
      
      <SikupiTracker />
      
      <CoffeeShopCTASection />
      
    </div>
  );
}
