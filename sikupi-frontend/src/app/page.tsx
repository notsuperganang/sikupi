"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/common/hero-section";
import { FeaturedProducts } from "@/components/products/featured-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Recycle, 
  Users, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  Leaf,
  Package,
  Star
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Dampak Positif Sikupi
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bergabunglah dengan ribuan petani dan pembeli yang telah merasakan manfaat ekonomi circular melalui platform kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Recycle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">2,500+</CardTitle>
                <p className="text-muted-foreground">Kg Limbah Terolah</p>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">156</CardTitle>
                <p className="text-muted-foreground">Pengguna Aktif</p>
              </CardHeader>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold">Rp 15M+</CardTitle>
                <p className="text-muted-foreground">Nilai Transaksi</p>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Mengapa Memilih Sikupi?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Platform yang menghubungkan petani kopi dengan pembeli limbah untuk menciptakan ekosistem yang berkelanjutan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-3" />
                <CardTitle className="text-xl">Kualitas Terjamin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Setiap produk melalui proses seleksi ketat dan penilaian AI untuk memastikan kualitas terbaik
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Leaf className="h-8 w-8 text-primary mb-3" />
                <CardTitle className="text-xl">Ramah Lingkungan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mendukung ekonomi circular dengan mengolah limbah kopi menjadi produk bernilai tinggi
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Package className="h-8 w-8 text-primary mb-3" />
                <CardTitle className="text-xl">Mudah & Terpercaya</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Platform yang user-friendly dengan sistem pembayaran yang aman dan pengiriman yang cepat
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Bergabung dengan Sikupi?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Mulai jual atau beli produk limbah kopi berkualitas tinggi sekarang juga
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/daftar">
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/produk">
                Jelajahi Produk
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}