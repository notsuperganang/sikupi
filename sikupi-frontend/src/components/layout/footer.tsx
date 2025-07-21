"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/components/common/container";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-white text-gray-700">
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
              <span className="text-xl font-bold text-gray-900">{APP_CONFIG.NAME}</span>
            </Link>
            <p className="text-gray-600 text-sm">
              Platform marketplace untuk limbah kopi yang menghubungkan petani dengan pembeli untuk menciptakan ekonomi circular yang berkelanjutan.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/produk" className="text-gray-600 hover:text-gray-900 transition-colors">Produk</Link></li>
              <li><Link href="/edukasi" className="text-gray-600 hover:text-gray-900 transition-colors">Edukasi</Link></li>
              <li><Link href="/tentang" className="text-gray-600 hover:text-gray-900 transition-colors">Tentang Kami</Link></li>
              <li><Link href="/kontak" className="text-gray-600 hover:text-gray-900 transition-colors">Kontak</Link></li>
              <li><Link href="/karir" className="text-gray-600 hover:text-gray-900 transition-colors">Karir</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dukungan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/bantuan" className="text-gray-600 hover:text-gray-900 transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</Link></li>
              <li><Link href="/panduan" className="text-gray-600 hover:text-gray-900 transition-colors">Panduan Pengguna</Link></li>
              <li><Link href="/syarat" className="text-gray-600 hover:text-gray-900 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/privasi" className="text-gray-600 hover:text-gray-900 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Hubungi Kami</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3"><Mail className="h-4 w-4 text-gray-500" /><span className="text-gray-600">hello@sikupi.com</span></div>
              <div className="flex items-center space-x-3"><Phone className="h-4 w-4 text-gray-500" /><span className="text-gray-600">+62 812 3456 7890</span></div>
              <div className="flex items-center space-x-3"><MapPin className="h-4 w-4 text-gray-500" /><span className="text-gray-600">Banda Aceh, Indonesia</span></div>
            </div>
            
            <div className="space-y-2 pt-2">
              <h4 className="font-medium text-gray-900">Newsletter</h4>
              <p className="text-xs text-gray-600">Dapatkan update terbaru tentang produk dan promo.</p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Email Anda"
                  className="bg-gray-50 border-gray-300 text-gray-900 text-sm focus:ring-gray-500"
                />
                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-white">Kirim</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-200" />

        {/* Payment Methods & Delivery Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Payment Methods */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Metode Pembayaran</h4>
            <div className="grid grid-cols-6 gap-3">
              {/* Bank Transfers */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Logo BCA_Biru.png" 
                  alt="BCA" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/BANK_BRI.png" 
                  alt="BRI" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/logo bni.png" 
                  alt="BNI" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/logo_mandiri.png" 
                  alt="Mandiri" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Bank_Syariah_Indonesia.png" 
                  alt="BSI" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              
              {/* Credit Cards */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Visa.png" 
                  alt="Visa" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Mastercard-logo.png" 
                  alt="Mastercard" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>

              {/* Digital Wallets */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Logo_ovo_purple.svg" 
                  alt="OVO" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Dana_logo.png" 
                  alt="DANA" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Gopay_logo.svg" 
                  alt="GoPay" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/LinkAja.svg" 
                  alt="LinkAja" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </div>
          </div>

          {/* Delivery Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Jasa Pengiriman</h4>
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/jne-logo.png" 
                  alt="JNE" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/J&T_Express_logo.svg" 
                  alt="J&T Express" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/sicepat-logo.png" 
                  alt="SiCepat" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Gojek_logo_2022.png" 
                  alt="Gojek" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center h-12">
                <Image 
                  src="/images/partners/Grab_(application)_logo.svg" 
                  alt="Grab" 
                  width={60} 
                  height={30}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-200" />

        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <p>© {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/syarat" className="hover:text-gray-900 transition-colors">Syarat & Ketentuan</Link>
            <Link href="/privasi" className="hover:text-gray-900 transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}