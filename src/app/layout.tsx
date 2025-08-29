import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthServerWrapper from "@/components/AuthServerWrapper";
import { QueryProvider } from "@/lib/query-client";
import { ToastProvider } from "@/lib/toast-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sikupi - Coffee Grounds Marketplace",
  description: "Marketplace untuk ampas kopi dan produk turunannya di Banda Aceh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Global providers only. Header/Footer applied in (site) route group layout. */}
        <QueryProvider>
          <AuthServerWrapper>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthServerWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
