import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthGuard } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Daftar - Sikupi",
  description: "Bergabung dengan Sikupi untuk mengakses marketplace ampas kopi cerdas",
};

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <AuthLayout
        title="Buat Akun Baru"
        description="Bergabunglah dengan komunitas Sikupi untuk menciptakan ekonomi sirkular berkelanjutan dari ampas kopi."
      >
        <RegisterForm />
      </AuthLayout>
    </AuthGuard>
  );
}