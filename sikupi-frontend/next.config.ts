import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfigurasi yang sudah ada
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static export if needed
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // --- TAMBAHAN UNTUK DEPLOY CEPAT ---
  typescript: {
    // !! PERINGATAN !!
    // Secara sengaja mengizinkan build produksi berhasil meskipun
    // proyek Anda memiliki error TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Peringatan: Ini mengizinkan build produksi berhasil meskipun
    // proyek Anda memiliki error ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
