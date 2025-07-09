// FILE: src/components/dashboard/dashboard-layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { useAuthStore } from "@/stores/auth-store";
import { AuthGuard } from "@/lib/auth/guards";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAuth={true} requiredRole="seller">
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
