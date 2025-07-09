// FILE PATH: /sikupi-frontend/src/components/auth/register-form.tsx

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
    setValue,
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
      userType: "" as any, // Initialize as empty string instead of undefined
      address: "",
      city: "",
      province: "",
      postalCode: "",
      businessName: "",
      businessType: "" as any, // Initialize as empty string instead of undefined
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
      console.log('Form data being submitted:', data); // Debug log
      
      // Prepare the registration data
      const registrationData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        userType: data.userType,
        address: data.address || "",
        city: data.city || "",
        province: data.province || "",
        postalCode: data.postalCode || "",
      };

      // Only add business fields for sellers
      if (data.userType === "seller") {
        Object.assign(registrationData, {
          businessName: data.businessName || "",
          businessType: data.businessType || "",
        });
      }

      console.log('Registration data prepared:', registrationData); // Debug log
      
      await registerUser(registrationData);
      
      toast.success("Registrasi berhasil!", {
        description: "Selamat datang di Sikupi! Akun Anda telah dibuat.",
      });

      router.push("/dashboard");
      
    } catch (error) {
      console.error('Registration form error:', error); // Debug log
      
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
              value={watchedFields.userType || ""}
              onValueChange={(value) => {
                setValue("userType", value as "seller" | "buyer", { shouldValidate: true });
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  : "Konfirmasi pendaftaran Anda"
                }
              </p>
            </div>

            {watchedUserType === "seller" && (
              <>
                <FormInput
                  label="Nama Bisnis"
                  placeholder="Nama kafe, toko, atau bisnis Anda"
                  required
                  error={errors.businessName?.message}
                  {...register("businessName")}
                />

                <FormSelect
                  label="Jenis Bisnis"
                  placeholder="Pilih jenis bisnis"
                  required
                  options={BUSINESS_TYPE_OPTIONS}
                  value={watchedFields.businessType || ""}
                  onValueChange={(value) => {
                    setValue("businessType", value, { shouldValidate: true });
                  }}
                  error={errors.businessType?.message}
                />
              </>
            )}

            <FormCheckbox
              label="Syarat dan Ketentuan"
              description={
                <span>
                  Saya menyetujui{" "}
                  <Link href="/syarat" className="text-primary hover:underline">
                    Syarat dan Ketentuan
                  </Link>{" "}
                  serta{" "}
                  <Link href="/privasi" className="text-primary hover:underline">
                    Kebijakan Privasi
                  </Link>{" "}
                  Sikupi
                </span>
              }
              required
              checked={watchedFields.termsAccepted || false}
              onCheckedChange={(checked) => {
                setValue("termsAccepted", checked, { shouldValidate: true });
              }}
              error={errors.termsAccepted?.message}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Sebelumnya
            </Button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isLoading}
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading || !watchedFields.termsAccepted}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                "Buat Akun"
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Login link */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-primary font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}