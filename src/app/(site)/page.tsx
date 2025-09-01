import { LandingHero } from "@/components/ui/landing-hero";
import { EcosystemBeamDemo } from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      <EcosystemBeamDemo />
    </div>
  );
}
