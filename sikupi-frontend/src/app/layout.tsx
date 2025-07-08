import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sikupi - Smart Coffee Waste Marketplace",
  description: "Transform coffee waste into valuable resources. Join our sustainable marketplace connecting coffee waste producers with buyers.",
  keywords: ["coffee waste", "marketplace", "sustainability", "circular economy", "coffee grounds"],
  authors: [{ name: "Sikupi Team" }],
  creator: "Sikupi",
  publisher: "Sikupi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sikupi.com",
    title: "Sikupi - Smart Coffee Waste Marketplace",
    description: "Transform coffee waste into valuable resources. Join our sustainable marketplace.",
    siteName: "Sikupi",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sikupi - Coffee Waste Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sikupi - Smart Coffee Waste Marketplace",
    description: "Transform coffee waste into valuable resources. Join our sustainable marketplace.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8B4513" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#2F1B14',
                border: '1px solid rgba(139, 69, 19, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 16px 0 rgba(139, 69, 19, 0.15)',
              },
              success: {
                iconTheme: {
                  primary: '#228B22',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#8B4513',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}