'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Heart
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  // All partner logos with consistent sizing
  const partnerLogos = [
    // Banking Partners
    { name: 'BCA', src: '/partners/Logo BCA_Biru.png', type: 'payment' },
    { name: 'BRI', src: '/partners/BANK_BRI.png', type: 'payment' },
    { name: 'BNI', src: '/partners/logo bni.png', type: 'payment' },
    { name: 'Mandiri', src: '/partners/logo_mandiri.png', type: 'payment' },
    { name: 'BSI', src: '/partners/Bank_Syariah_Indonesia.png', type: 'payment' },
    
    // Digital Payment Partners
    { name: 'DANA', src: '/partners/Dana_logo.png', type: 'payment' },
    { name: 'GoPay', src: '/partners/Gopay_logo.svg', type: 'payment' },
    { name: 'OVO', src: '/partners/Logo_ovo_purple.svg', type: 'payment' },
    { name: 'LinkAja', src: '/partners/LinkAja.svg', type: 'payment' },
    
    // Card Payment Partners
    { name: 'Visa', src: '/partners/Visa.png', type: 'payment' },
    { name: 'Mastercard', src: '/partners/Mastercard-logo.png', type: 'payment' },
    
    // Transportation & Delivery Partners
    { name: 'Grab', src: '/partners/Grab_(application)_logo.svg', type: 'transport' },
    { name: 'Gojek', src: '/partners/Gojek_logo_2022.png', type: 'transport' },
    
    // Shipping Partners
    { name: 'JNE', src: '/partners/jne-logo.png', type: 'shipping' },
    { name: 'SiCepat', src: '/partners/sicepat-logo.png', type: 'shipping' },
    { name: 'J&T Express', src: '/partners/J&T_Express_logo.svg', type: 'shipping' },
  ]

  // Filter logos by type for organized display
  const paymentMethods = partnerLogos.filter(logo => logo.type === 'payment')
  const shippingProviders = partnerLogos.filter(logo => logo.type === 'shipping' || logo.type === 'transport')

  return (
    <footer className="bg-stone-900 text-white" aria-label="Footer">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Kontak Kami */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Kontak Kami</h3>
            <div className="space-y-3 text-sm">
              <a 
                href="mailto:support@sikupi.id" 
                className="flex items-center space-x-2 text-stone-300 hover:text-amber-400 transition-colors"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@sikupi.id</span>
              </a>
              <a 
                href="https://wa.me/6281234567890" 
                className="flex items-center space-x-2 text-stone-300 hover:text-amber-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </a>
              <div className="flex items-start space-x-2 text-stone-300">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Banda Aceh, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Sikupi */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Sikupi</h3>
            <nav className="space-y-3 text-sm">
              <Link 
                href="/about" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Tentang Kami
              </Link>
              <Link 
                href="/magazine" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Majalah
              </Link>
              <Link 
                href="/partners" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Kemitraan
              </Link>
              <Link 
                href="/privacy" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Kebijakan Privasi
              </Link>
            </nav>
          </div>

          {/* Column 3 - Bantuan */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Bantuan</h3>
            <nav className="space-y-3 text-sm">
              <Link 
                href="/help/shipping" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Pengiriman
              </Link>
              <Link 
                href="/help/returns" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Pengembalian
              </Link>
              <Link 
                href="/help/warranty" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Garansi
              </Link>
              <Link 
                href="/help/faq" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                FAQ / Bantuan
              </Link>
            </nav>
          </div>

          {/* Column 4 - Customer Care */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Customer Care</h3>
            <nav className="space-y-3 text-sm">
              <Link 
                href="/contact" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Hubungi Kami
              </Link>
              <Link 
                href="/payment/confirm" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Konfirmasi Pembayaran
              </Link>
              <Link 
                href="/help/how-to-buy" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Panduan Belanja
              </Link>
              <Link 
                href="/wholesale" 
                className="block text-stone-300 hover:text-amber-400 transition-colors"
              >
                Harga Grosir
              </Link>
            </nav>
          </div>
        </div>

        {/* Social Media Row */}
        <div className="border-t border-stone-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-amber-400 mb-2">
                Dapatkan update seputar kopi
              </h3>
              <p className="text-stone-400 text-sm">
                Ikuti kami untuk tips, resep, dan berita terbaru
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com/sikupi"
                className="text-stone-400 hover:text-pink-400 transition-colors p-2 rounded-full hover:bg-stone-800"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Sikupi"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com/sikupi"
                className="text-stone-400 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-stone-800"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Sikupi"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/sikupi"
                className="text-stone-400 hover:text-sky-400 transition-colors p-2 rounded-full hover:bg-stone-800"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Sikupi"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com/sikupi"
                className="text-stone-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-stone-800"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Sikupi"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Payment & Shipping Methods */}
        <div className="border-t border-stone-800 pt-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Methods */}
            <div className="space-y-6">
              <h4 className="font-semibold text-amber-400 text-lg text-center">Metode Pembayaran</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {paymentMethods.map((payment, idx) => {
                  // Special sizing for logos that are naturally small
                  const isSmallLogo = ['BCA', 'BRI'].includes(payment.name);
                  const logoHeight = isSmallLogo ? '3.5rem' : '2.5rem'; // 56px vs 40px for even bigger BCA/BRI
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg p-3 h-16 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                      <img 
                        src={payment.src} 
                        alt={`${payment.name} logo`}
                        className="max-w-full object-contain"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '100%',
                          maxHeight: logoHeight
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping & Delivery Methods */}
            <div className="space-y-6">
              <h4 className="font-semibold text-amber-400 text-lg text-center">Jasa Pengiriman</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {shippingProviders.map((shipping, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 h-16 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
                    <img 
                      src={shipping.src} 
                      alt={`${shipping.name} logo`}
                      className="max-h-10 max-w-full object-contain"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '2.5rem'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-sm text-stone-400">
            <div>
              © {currentYear} Sikupi — Banda Aceh, Indonesia
            </div>
            <div className="flex items-center space-x-1">
              <span>Dibuat dengan</span>
              <Heart className="h-4 w-4 text-red-400" fill="currentColor" />
              <span>Upcycle</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer