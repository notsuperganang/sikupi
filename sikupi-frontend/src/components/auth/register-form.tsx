// FILE: src/components/auth/register-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegister } from "@/lib/hooks/use-auth";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    userType: "" as "seller" | "buyer",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    businessName: "",
    businessType: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, userType: value as "seller" | "buyer" }));
    if (errors.userType) {
      setErrors(prev => ({ ...prev, userType: "" }));
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

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid";
    }

    if (!formData.userType) {
      newErrors.userType = "Jenis pengguna wajib dipilih";
    }

    if (formData.userType === "seller") {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Nama bisnis wajib diisi untuk penjual";
      }
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
      // FIXED: Rename to avoid variable collision
      const { confirmPassword, ...registrationData } = formData;
      
      // FIXED: Create properly typed clean data
      const cleanedData: any = {};
      
      // Copy required fields
      cleanedData.email = registrationData.email;
      cleanedData.password = registrationData.password;
      cleanedData.fullName = registrationData.fullName;
      cleanedData.phone = registrationData.phone;
      cleanedData.userType = registrationData.userType;
      
      // Add optional fields only if they have values
      if (registrationData.address?.trim()) {
        cleanedData.address = registrationData.address;
      }
      if (registrationData.city?.trim()) {
        cleanedData.city = registrationData.city;
      }
      if (registrationData.province?.trim()) {
        cleanedData.province = registrationData.province;
      }
      if (registrationData.postalCode?.trim()) {
        cleanedData.postalCode = registrationData.postalCode;
      }
      
      // Business fields only for sellers
      if (registrationData.userType === 'seller') {
        if (registrationData.businessName?.trim()) {
          cleanedData.businessName = registrationData.businessName;
        }
        if (registrationData.businessType?.trim()) {
          cleanedData.businessType = registrationData.businessType;
        }
      }

      console.log('Sending registration data:', cleanedData); // Debug log
      
      await registerMutation.mutateAsync(cleanedData);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Daftar ke Sikupi
        </CardTitle>
        <CardDescription className="text-center">
          Buat akun baru untuk bergabung dengan marketplace ampas kopi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type */}
          <div className="space-y-2">
            <Label htmlFor="userType">Jenis Pengguna</Label>
            <Select value={formData.userType} onValueChange={handleSelectChange}>
              <SelectTrigger className={errors.userType ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih jenis pengguna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Pembeli</SelectItem>
                <SelectItem value="seller">Penjual</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-sm text-red-500">{errors.userType}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={formData.fullName}
              onChange={handleChange}
              disabled={registerMutation.isPending}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={registerMutation.isPending}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="08123456789"
              value={formData.phone}
              onChange={handleChange}
              disabled={registerMutation.isPending}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
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
                disabled={registerMutation.isPending}
                className={errors.password ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={registerMutation.isPending}
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={registerMutation.isPending}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={registerMutation.isPending}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Business Name (for sellers) */}
          {formData.userType === "seller" && (
            <div className="space-y-2">
              <Label htmlFor="businessName">Nama Bisnis</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Masukkan nama bisnis"
                value={formData.businessName}
                onChange={handleChange}
                disabled={registerMutation.isPending}
                className={errors.businessName ? "border-red-500" : ""}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500">{errors.businessName}</p>
              )}
            </div>
          )}

          {/* Address (optional) */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat (Opsional)</Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Masukkan alamat"
              value={formData.address}
              onChange={handleChange}
              disabled={registerMutation.isPending}
            />
          </div>

          {/* City (optional) */}
          <div className="space-y-2">
            <Label htmlFor="city">Kota (Opsional)</Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Masukkan kota"
              value={formData.city}
              onChange={handleChange}
              disabled={registerMutation.isPending}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Daftar"
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Sudah punya akun? </span>
          <Link 
            href="/masuk" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Masuk sekarang
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}