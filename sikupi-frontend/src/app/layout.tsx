import type { Metadata, Viewport } from "next"; // 1. Tambahkan Viewport
import { Inter } from "next/font/google";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 2. Objek metadata sekarang tidak lagi berisi viewport
export const metadata: Metadata = {
  title: "Sikupi - Marketplace Ampas Kopi Cerdas",
  description: "Platform marketplace inovatif untuk jual-beli ampas kopi yang didukung teknologi AI. Menghubungkan produsen ampas kopi dengan pembeli untuk menciptakan ekonomi sirkular berkelanjutan.",
  keywords: ["ampas kopi", "marketplace", "sustainable", "AI", "coffee waste", "circular economy"],
  authors: [{ name: "Sikupi Team" }],
  creator: "Sikupi",
  publisher: "Sikupi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Sikupi - Marketplace Ampas Kopi Cerdas",
    description: "Platform marketplace inovatif untuk jual-beli ampas kopi yang didukung teknologi AI",
    url: "https://sikupi.com",
    siteName: "Sikupi",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sikupi - Marketplace Ampas Kopi Cerdas",
    description: "Platform marketplace inovatif untuk jual-beli ampas kopi yang didukung teknologi AI",
  },
};

// 3. Buat ekspor terpisah untuk viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            theme="light"
          />
        </QueryProvider>
      </body>
    </html>
  );
}
