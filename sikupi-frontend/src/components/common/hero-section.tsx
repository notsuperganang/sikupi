import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "./container";
import { ArrowRight, Leaf, Recycle, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Marketplace{" "}
                <span className="text-primary">Ampas Kopi</span>{" "}
                Cerdas
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                Platform inovatif yang menghubungkan produsen ampas kopi dengan pembeli, 
                didukung teknologi AI untuk menciptakan ekonomi sirkular berkelanjutan.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/produk">
                  Jelajahi Produk
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link href="/daftar">
                  Mulai Berjualan
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Produk Terjual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Partner Kafe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">5 Ton</div>
                <div className="text-sm text-muted-foreground">Ampas Terselamatkan</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg shadow-soft">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Ramah Lingkungan</h3>
                <p className="text-sm text-muted-foreground">
                  Mengurangi limbah kopi dan menciptakan produk bernilai tambah
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-soft">
                <div className="bg-accent/10 p-3 rounded-full w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">AI Quality Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Penilaian kualitas otomatis menggunakan teknologi AI
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-soft">
                <div className="bg-secondary/10 p-3 rounded-full w-fit mb-4">
                  <Recycle className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Ekonomi Sirkular</h3>
                <p className="text-sm text-muted-foreground">
                  Menciptakan nilai ekonomi dari limbah yang terbuang
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-soft">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Mudah Digunakan</h3>
                <p className="text-sm text-muted-foreground">
                  Interface yang intuitif untuk semua kalangan
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}