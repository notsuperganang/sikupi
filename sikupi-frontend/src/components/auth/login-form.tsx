// FILE: src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@/lib/hooks/use-auth";
import { toast } from "sonner";

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  const loginMutation = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await loginMutation.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleDemoLogin = (userType: 'seller' | 'buyer') => {
    const demoCredentials = {
      email: userType === 'seller' ? 'seller@sikupi.com' : 'buyer@sikupi.com',
      password: 'password123'
    };
    
    setFormData(demoCredentials);
    loginMutation.mutate(demoCredentials);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Masuk ke Sikupi
        </CardTitle>
        <CardDescription className="text-center">
          Masuk dengan akun Anda untuk melanjutkan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loginMutation.isPending}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleChange}
                disabled={loginMutation.isPending}
                className={errors.password ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loginMutation.isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>

        {/* Demo Login Buttons */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 text-center mb-3">
            Demo Login (untuk testing):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('seller')}
              disabled={loginMutation.isPending}
            >
              Login Seller
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('buyer')}
              disabled={loginMutation.isPending}
            >
              Login Buyer
            </Button>
          </div>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Belum punya akun? </span>
          <Link 
            href="/daftar" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Daftar sekarang
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}