import { z } from "zod";

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password harus mengandung huruf besar, huruf kecil, dan angka"
    ),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi"),
  phone: z
    .string()
    .min(1, "Nomor telepon harus diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor telepon tidak valid (contoh: 08123456789)"
    ),
  userType: z.enum(["seller", "buyer"], {
    required_error: "Pilih jenis akun",
  }),
  address: z
    .string()
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  city: z
    .string()
    .min(2, "Kota minimal 2 karakter")
    .max(100, "Kota maksimal 100 karakter"),
  province: z
    .string()
    .min(2, "Provinsi minimal 2 karakter")
    .max(100, "Provinsi maksimal 100 karakter"),
  postalCode: z
    .string()
    .min(5, "Kode pos minimal 5 digit")
    .max(5, "Kode pos maksimal 5 digit")
    .regex(/^\d+$/, "Kode pos hanya boleh mengandung angka"),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "Anda harus menyetujui syarat dan ketentuan"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.userType === "seller") {
    return data.businessName && data.businessName.length >= 2;
  }
  return true;
}, {
  message: "Nama bisnis harus diisi untuk akun penjual",
  path: ["businessName"],
});

// Product validation schemas
export const productSchema = z.object({
  title: z
    .string()
    .min(5, "Judul produk minimal 5 karakter")
    .max(200, "Judul produk maksimal 200 karakter"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
  category: z
    .string()
    .min(1, "Kategori harus dipilih"),
  price: z
    .number()
    .min(1000, "Harga minimal Rp 1.000")
    .max(10000000, "Harga maksimal Rp 10.000.000"),
  stock: z
    .number()
    .min(1, "Stok minimal 1")
    .max(10000, "Stok maksimal 10.000"),
  weight: z
    .number()
    .min(0.1, "Berat minimal 0.1 kg")
    .max(1000, "Berat maksimal 1000 kg"),
  location: z
    .string()
    .min(2, "Lokasi minimal 2 karakter")
    .max(100, "Lokasi maksimal 100 karakter"),
  images: z
    .array(z.string())
    .min(1, "Minimal 1 gambar produk")
    .max(5, "Maksimal 5 gambar produk"),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  grade: z.enum(["A", "B", "C"]).optional(),
  sortBy: z.enum(["newest", "oldest", "price_low", "price_high", "rating"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
});

// User profile schemas
export const userProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  phone: z
    .string()
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor telepon tidak valid"
    ),
  address: z
    .string()
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  city: z
    .string()
    .min(2, "Kota minimal 2 karakter")
    .max(100, "Kota maksimal 100 karakter"),
  province: z
    .string()
    .min(2, "Provinsi minimal 2 karakter")
    .max(100, "Provinsi maksimal 100 karakter"),
  postalCode: z
    .string()
    .min(5, "Kode pos minimal 5 digit")
    .max(5, "Kode pos maksimal 5 digit")
    .regex(/^\d+$/, "Kode pos hanya boleh mengandung angka"),
  businessName: z.string().optional(),
  businessType: z.string().optional(),
});

// Cart schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID harus ada"),
  quantity: z
    .number()
    .min(1, "Quantity minimal 1")
    .max(100, "Quantity maksimal 100"),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Keranjang tidak boleh kosong"),
  shippingAddress: z.object({
    fullName: z.string().min(2, "Nama lengkap harus diisi"),
    phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Format nomor telepon tidak valid"),
    address: z.string().min(10, "Alamat lengkap harus diisi"),
    city: z.string().min(2, "Kota harus diisi"),
    province: z.string().min(2, "Provinsi harus diisi"),
    postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
  }),
  paymentMethod: z.enum(["bank_transfer", "credit_card", "e_wallet"], {
    required_error: "Metode pembayaran harus dipilih",
  }),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

// Contact form schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z
    .string()
    .email("Format email tidak valid"),
  subject: z
    .string()
    .min(5, "Subjek minimal 5 karakter")
    .max(200, "Subjek maksimal 200 karakter"),
  message: z
    .string()
    .min(10, "Pesan minimal 10 karakter")
    .max(1000, "Pesan maksimal 1000 karakter"),
});

// AI Assessment schema
export const aiAssessmentSchema = z.object({
  images: z
    .array(z.instanceof(File))
    .min(1, "Minimal 1 foto ampas kopi")
    .max(3, "Maksimal 3 foto")
    .refine((files) => {
      return files.every(file => 
        ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      );
    }, "Format file harus JPG, PNG, atau WebP")
    .refine((files) => {
      return files.every(file => file.size <= 5 * 1024 * 1024); // 5MB
    }, "Ukuran file maksimal 5MB"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type CartItemFormData = z.infer<typeof cartItemSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type AIAssessmentFormData = z.infer<typeof aiAssessmentSchema>;