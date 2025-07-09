"use client";

import { DashboardHeader } from "./dashboard-header";
import { AuthGuard } from "@/lib/auth/guards";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAuth={true} requiredRole="seller">
      {/* DIUBAH: Menggunakan warna dari tema */}
      <div className={`min-h-screen bg-muted/40 ${className}`}>
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
