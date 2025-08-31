import { z } from 'zod'
import type { CoffeeType, GrindLevel, Condition } from '@/types/database'

// Form validation schema for Ampas Analyzer
export const AmpasAnalyzerFormSchema = z.object({
  jenis_kopi: z.enum(['arabika', 'robusta', 'mix', 'unknown'] as const, {
    required_error: 'Pilih jenis kopi',
  }),
  grind_level: z.enum(['halus', 'sedang', 'kasar', 'unknown'] as const, {
    required_error: 'Pilih tingkat kehalusan',
  }),
  condition: z.enum(['basah', 'kering', 'unknown'] as const, {
    required_error: 'Pilih kondisi ampas',
  }),
  images: z.array(z.instanceof(File), {
    required_error: 'Upload minimal 1 gambar',
  }).min(1, 'Upload minimal 1 gambar')
    .max(3, 'Maksimal 3 gambar')
    .refine(
      (files) => files.every(file => file.size <= 10 * 1024 * 1024), // 10MB per file
      'Ukuran file maksimal 10MB'
    )
    .refine(
      (files) => files.every(file => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)),
      'Format file harus JPG atau PNG'
    ),
})

export type AmpasAnalyzerFormData = z.infer<typeof AmpasAnalyzerFormSchema>

// Translation maps for display
export const coffeeTypeTranslations: Record<CoffeeType, string> = {
  arabika: 'Arabika',
  robusta: 'Robusta', 
  mix: 'Campuran',
  unknown: 'Tidak Diketahui'
}

export const grindLevelTranslations: Record<GrindLevel, string> = {
  halus: 'Halus',
  sedang: 'Sedang',
  kasar: 'Kasar',
  unknown: 'Tidak Diketahui'
}

export const conditionTranslations: Record<Condition, string> = {
  basah: 'Basah',
  kering: 'Kering',
  unknown: 'Tidak Diketahui'
}

// Loading states for analysis
export const analysisLoadingStates = [
  { text: "Memproses gambar ampas kopi..." },
  { text: "Menganalisis karakteristik visual..." },
  { text: "Menghitung estimasi harga..." },
  { text: "Menilai kesesuaian produk..." },
  { text: "Menyusun rekomendasi..." }
]