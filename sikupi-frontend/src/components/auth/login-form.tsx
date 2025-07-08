"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormCheckbox } from "@/components/forms/form-checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, data.rememberMe);
      
      toast.success("Login berhasil!", {
        description: "Selamat datang kembali di Sikupi",
      });

      // Redirect to dashboard or intended page
      const returnUrl = new URLSearchParams(window.location.search).get("returnUrl") || "/dashboard";
      router.push(returnUrl);
      
    } catch (error) {
      toast.error("Login gagal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat login",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          placeholder="nama@email.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="Masukkan password"
          required
          showPasswordToggle
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <FormCheckbox
            label="Ingat saya"
            checked={rememberMe}
            onCheckedChange={(checked) => {
              setRememberMe(checked);
              register("rememberMe").onChange({
                target: { value: checked, name: "rememberMe" }
              });
            }}
          />

          <Link 
            href="/lupa-password" 
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Lupa password?
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sedang masuk...
            </>
          ) : (
            "Masuk"
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Atau
            </span>
          </div>
        </div>

        {/* Social Login Buttons - Placeholder for future implementation */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" size="lg" disabled>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
          <Button variant="outline" size="lg" disabled>
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Daftar sekarang
          </Link>
        </div>
      </div>
    </form>
  );
}