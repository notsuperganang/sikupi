// FILE: src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthInitializer } from "@/components/auth-initializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sikupi - Smart Coffee Waste Marketplace",
  description: "Platform marketplace untuk limbah kopi yang cerdas dan berkelanjutan",
  keywords: ["coffee waste", "marketplace", "sustainable", "circular economy"],
  authors: [{ name: "Sikupi Team" }],
  openGraph: {
    title: "Sikupi - Smart Coffee Waste Marketplace",
    description: "Platform marketplace untuk limbah kopi yang cerdas dan berkelanjutan",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
          <Toaster position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  );
}