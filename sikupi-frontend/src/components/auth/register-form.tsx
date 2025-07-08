"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormCheckbox } from "@/components/forms/form-checkbox";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const USER_TYPE_OPTIONS = [
  { value: "buyer", label: "Pembeli - Saya ingin membeli ampas kopi" },
  { value: "seller", label: "Penjual - Saya ingin menjual ampas kopi" },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: "cafe", label: "Kafe" },
  { value: "restaurant", label: "Restoran" },
  { value: "hotel", label: "Hotel" },
  { value: "roastery", label: "Roastery" },
  { value: "other", label: "Lainnya" },
];

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      userType: undefined,
      address: "",
      city: "",
      province: "",
      postalCode: "",
      businessName: "",
      businessType: "",
      termsAccepted: false,
    },
  });

  const watchedUserType = watch("userType");
  const watchedFields = watch();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = async (step: number) => {
    const stepFields = getStepFields(step);
    return await trigger(stepFields);
  };

  const getStepFields = (step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 1:
        return ["email", "password", "confirmPassword", "fullName"];
      case 2:
        return ["phone", "userType", "address", "city", "province", "postalCode"];
      case 3:
        return watchedUserType === "seller" 
          ? ["businessName", "businessType", "termsAccepted"]
          : ["termsAccepted"];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      
      toast.success("Registrasi berhasil!", {
        description: "Selamat datang di Sikupi! Akun Anda telah dibuat.",
      });

      router.push("/dashboard");
      
    } catch (error) {
      toast.error("Registrasi gagal", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat mendaftar",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Informasi Akun</h3>
              <p className="text-sm text-muted-foreground">
                Masukkan email dan password untuk akun baru Anda
              </p>
            </div>

            <FormInput
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              required
              error={errors.fullName?.message}
              {...register("fullName")}
            />

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
              placeholder="Buat password yang kuat"
              required
              showPasswordToggle
              description="Minimal 6 karakter dengan huruf besar, huruf kecil, dan angka"
              error={errors.password?.message}
              {...register("password")}
            />

            <FormInput
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              required
              showPasswordToggle
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Informasi Profil</h3>
              <p className="text-sm text-muted-foreground">
                Lengkapi profil Anda untuk pengalaman yang lebih baik
              </p>
            </div>

            <FormInput
              label="Nomor Telepon"
              type="tel"
              placeholder="08123456789"
              required
              error={errors.phone?.message}
              {...register("phone")}
            />

            <FormSelect
              label="Jenis Akun"
              placeholder="Pilih jenis akun"
              required
              options={USER_TYPE_OPTIONS}
              value={watchedFields.userType}
              onValueChange={(value) => {
                register("userType").onChange({
                  target: { value, name: "userType" }
                });
              }}
              error={errors.userType?.message}
            />

            <FormInput
              label="Alamat Lengkap"
              placeholder="Jl. Contoh No. 123"
              required
              error={errors.address?.message}
              {...register("address")}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Kota"
                placeholder="Jakarta"
                required
                error={errors.city?.message}
                {...register("city")}
              />

              <FormInput
                label="Provinsi"
                placeholder="DKI Jakarta"
                required
                error={errors.province?.message}
                {...register("province")}
              />
            </div>

            <FormInput
              label="Kode Pos"
              placeholder="12345"
              required
              maxLength={5}
              error={errors.postalCode?.message}
              {...register("postalCode")}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">
                {watchedUserType === "seller" ? "Informasi Bisnis" : "Konfirmasi"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {watchedUserType === "seller" 
                  ? "Lengkapi informasi bisnis Anda"
                  : "Setujui syarat dan ketentuan untuk menyelesaikan pendaftaran"
                }
              </p>
            </div>

            {watchedUserType === "seller" && (
              <>
                <FormInput
                  label="Nama Bisnis"
                  placeholder="Kafe ABC, Hotel XYZ, dll."
                  required
                  error={errors.businessName?.message}
                  {...register("businessName")}
                />

                <FormSelect
                  label="Jenis Bisnis"
                  placeholder="Pilih jenis bisnis"
                  options={BUSINESS_TYPE_OPTIONS}
                  value={watchedFields.businessType}
                  onValueChange={(value) => {
                    register("businessType").onChange({
                      target: { value, name: "businessType" }
                    });
                  }}
                  error={errors.businessType?.message}
                />
              </>
            )}

            <FormCheckbox
              required
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                setTermsAccepted(checked);
                register("termsAccepted").onChange({
                  target: { value: checked, name: "termsAccepted" }
                });
              }}
              error={errors.termsAccepted?.message}
            >
              Saya menyetujui{" "}
              <Link href="/syarat" className="text-primary hover:text-primary/80 underline">
                Syarat & Ketentuan
              </Link>{" "}
              dan{" "}
              <Link href="/privasi" className="text-primary hover:text-primary/80 underline">
                Kebijakan Privasi
              </Link>{" "}
              Sikupi
            </FormCheckbox>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Langkah {currentStep} dari {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Button>
        )}

        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            className="flex-1"
          >
            Selanjutnya
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading || !termsAccepted}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sedang mendaftar...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </Button>
        )}
      </div>

      {/* Login Link */}
      <div className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Masuk di sini
        </Link>
      </div>
    </form>
  );
}