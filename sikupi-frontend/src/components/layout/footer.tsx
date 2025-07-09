// FILE: src/components/layout/footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/common/container";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    // CHANGED: Using a thematic 'stone' color palette
    <footer className="bg-stone-950 text-stone-300">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src={APP_CONFIG.LOGO_PATH}
                alt={APP_CONFIG.NAME}
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-white">{APP_CONFIG.NAME}</span>
            </Link>
            <p className="text-stone-400 text-sm">
              Platform marketplace untuk limbah kopi yang menghubungkan petani dengan pembeli untuk menciptakan ekonomi circular yang berkelanjutan.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/produk" className="text-stone-400 hover:text-white transition-colors">Produk</Link></li>
              <li><Link href="/edukasi" className="text-stone-400 hover:text-white transition-colors">Edukasi</Link></li>
              <li><Link href="/tentang" className="text-stone-400 hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="/kontak" className="text-stone-400 hover:text-white transition-colors">Kontak</Link></li>
              <li><Link href="/karir" className="text-stone-400 hover:text-white transition-colors">Karir</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Dukungan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/bantuan" className="text-stone-400 hover:text-white transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="/faq" className="text-stone-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/panduan" className="text-stone-400 hover:text-white transition-colors">Panduan Pengguna</Link></li>
              <li><Link href="/syarat" className="text-stone-400 hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/privasi" className="text-stone-400 hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Hubungi Kami</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3"><Mail className="h-4 w-4 text-stone-500" /><span className="text-stone-400">hello@sikupi.com</span></div>
              <div className="flex items-center space-x-3"><Phone className="h-4 w-4 text-stone-500" /><span className="text-stone-400">+62 812 3456 7890</span></div>
              <div className="flex items-center space-x-3"><MapPin className="h-4 w-4 text-stone-500" /><span className="text-stone-400">Banda Aceh, Indonesia</span></div>
            </div>
            
            <div className="space-y-2 pt-2">
              <h4 className="font-medium text-white">Newsletter</h4>
              <p className="text-xs text-stone-400">Dapatkan update terbaru tentang produk dan promo.</p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Email Anda"
                  className="bg-stone-900 border-stone-800 text-white text-sm focus:ring-stone-500"
                />
                {/* CHANGED: Button color is now thematic 'stone' to match the image */}
                <Button size="sm" className="bg-stone-700 hover:bg-stone-600 text-white">Kirim</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-stone-800" />

        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-stone-400">
          <p>© {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/syarat" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <Link href="/privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}