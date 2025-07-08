import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/common/container";
import { FOOTER_LINKS, APP_CONFIG } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src={APP_CONFIG.LOGO_PATH}
                  alt={APP_CONFIG.NAME}
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-lg font-bold text-primary">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Platform marketplace inovatif untuk jual-beli ampas kopi yang didukung teknologi AI. 
                Menciptakan ekonomi sirkular berkelanjutan dari limbah kopi.
              </p>
              <div className="flex space-x-4">
                <Link 
                  href={APP_CONFIG.SOCIAL_MEDIA.INSTAGRAM}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link 
                  href={APP_CONFIG.SOCIAL_MEDIA.TWITTER}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link 
                  href={APP_CONFIG.SOCIAL_MEDIA.FACEBOOK}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link 
                  href={APP_CONFIG.SOCIAL_MEDIA.LINKEDIN}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Perusahaan
              </h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Dukungan
              </h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Kategori
              </h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.categories.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {APP_CONFIG.CONTACT_EMAIL}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {APP_CONFIG.CONTACT_PHONE}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Jakarta, Indonesia
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} {APP_CONFIG.NAME}. All rights reserved.
            </div>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <Link href="/privasi" className="hover:text-primary transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/syarat" className="hover:text-primary transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/cookie" className="hover:text-primary transition-colors">
                Kebijakan Cookie
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}