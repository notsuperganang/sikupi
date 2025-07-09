// FILE: src/app/masuk/page.tsx
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Masuk - Sikupi",
  description: "Masuk ke akun Sikupi Anda untuk mengakses marketplace ampas kopi",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}