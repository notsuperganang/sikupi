import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthGuard } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Masuk - Sikupi",
  description: "Masuk ke akun Sikupi Anda untuk mengakses marketplace ampas kopi cerdas",
};

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <AuthLayout
        title="Masuk ke Akun"
        description="Selamat datang kembali! Masuk untuk melanjutkan pengalaman Anda di Sikupi."
      >
        <LoginForm />
      </AuthLayout>
    </AuthGuard>
  );
}