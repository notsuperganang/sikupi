// FILE: src/app/daftar/page.tsx
import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Daftar - Sikupi",
  description: "Daftar akun baru untuk bergabung dengan marketplace ampas kopi Sikupi",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}