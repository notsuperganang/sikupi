import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "Sikupi - Masuk atau Daftar",
  description: "Masuk atau daftar akun Sikupi untuk mengakses marketplace ampas kopi",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen">
          {children}
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}