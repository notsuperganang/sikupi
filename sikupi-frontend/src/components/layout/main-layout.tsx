// FILE: src/components/layout/main-layout.tsx
"use client";

import { Header } from "./header";
import { Footer } from "./footer";
import { useAuthInitialize } from "@/lib/auth/hooks";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  // Initialize auth state
  useAuthInitialize();

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}