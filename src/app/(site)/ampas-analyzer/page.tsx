"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Upload, Brain, TrendingUp, MessageSquare, ArrowRight, Coffee, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';
import { BackgroundRippleEffectReverse } from "@/components/ui/background-ripple-effect-reverse";
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { CometCard } from '@/components/ui/comet-card';
import { AmpasHeroSection } from './components/AmpasHeroSection';
import { ViewportTextGenerateEffect } from '@/components/ui/viewport-text-generate-effect';

// Content for the How It Works section
const howItWorksContent = [
  {
    title: "1. Upload Foto Ampas Kopi",
    description: "Ambil foto ampas kopi Anda dengan pencahayaan yang baik. AI kami akan menganalisis karakteristik visual seperti tekstur, warna, dan kondisi ampas kopi secara detail untuk memberikan hasil yang akurat.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-300 shadow-lg overflow-hidden relative">
        {/* Coffee beans pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-6 h-6 bg-amber-800 rounded-full"></div>
          <div className="absolute top-8 right-8 w-4 h-4 bg-amber-700 rounded-full"></div>
          <div className="absolute bottom-6 left-8 w-5 h-5 bg-amber-900 rounded-full"></div>
          <div className="absolute bottom-4 right-6 w-3 h-3 bg-amber-600 rounded-full"></div>
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center space-y-6 text-amber-900 z-10"
        >
          <div className="p-4 bg-amber-200 rounded-2xl shadow-md">
            <Upload className="h-20 w-20 text-amber-800" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-bold text-lg">Unggah Gambar</p>
            <p className="text-sm text-amber-700 font-medium">Seret & lepas atau klik untuk unggah</p>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <span>📸</span>
              <span>Resolusi tinggi untuk hasil terbaik</span>
            </div>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    title: "2. AI Processing",
    description: "Sistem menganalisis jenis kopi (Arabica/Robusta), tingkat gilingan (halus/sedang/kasar), dan kondisi ampas (basah/kering) menggunakan teknologi computer vision yang canggih dengan akurasi tinggi.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex flex-col items-center justify-center rounded-2xl border-2 border-blue-300 shadow-lg relative overflow-hidden">
        {/* Neural network pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <defs>
              <pattern id="neural" patternUnits="userSpaceOnUse" width="40" height="40">
                <circle cx="20" cy="20" r="2" fill="#3B82F6"/>
                <line x1="10" y1="10" x2="30" y2="30" stroke="#3B82F6" strokeWidth="1"/>
                <line x1="30" y1="10" x2="10" y2="30" stroke="#3B82F6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural)"/>
          </svg>
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center space-y-6 text-blue-900 z-10"
        >
          <div className="p-4 bg-blue-200 rounded-2xl shadow-md relative">
            <Brain className="h-20 w-20 text-blue-800" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="font-bold text-lg">Analisis AI</p>
            <p className="text-sm text-blue-700 font-medium">Menganalisis karakteristik ampas</p>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <span>🧠</span>
              <span>95% akurasi dengan deep learning</span>
            </div>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    title: "3. Instant Results",
    description: "Dapatkan estimasi harga pasar dan insight mendalam tentang potensi ampas kopi Anda. Hasil analisis mencakup kesesuaian produk, dampak lingkungan, dan rekomendasi proses yang dapat meningkatkan nilai jual.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex flex-col items-center justify-center rounded-2xl border-2 border-green-300 shadow-lg relative overflow-hidden">
        {/* Money/chart pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-2xl">💰</div>
          <div className="absolute top-8 right-8 text-xl">📊</div>
          <div className="absolute bottom-6 left-8 text-lg">📈</div>
          <div className="absolute bottom-4 right-6 text-xl">✨</div>
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center space-y-6 text-green-900 z-10"
        >
          <div className="p-4 bg-green-200 rounded-2xl shadow-md relative">
            <TrendingUp className="h-20 w-20 text-green-800" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-bounce"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="font-bold text-lg">Hasil Siap</p>
            <p className="text-sm text-green-700 font-medium">Estimasi harga & insight lengkap</p>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <span>⚡</span>
              <span>Hasil dalam hitungan detik</span>
            </div>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    title: "4. Screenshot & Hubungi Admin",
    description: "Screenshot hasil analisis Anda dan kirim ke admin Sikupi melalui WhatsApp. Admin akan membeli ampas kopi Anda dengan harga minimal sesuai hasil analisis sebagai jaminan kepercayaan terhadap teknologi kami.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 flex flex-col items-center justify-center rounded-2xl border-2 border-amber-300 shadow-lg relative overflow-hidden">
        {/* WhatsApp/Chat pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-2xl">💬</div>
          <div className="absolute top-8 right-8 text-xl">📱</div>
          <div className="absolute bottom-6 left-8 text-lg">💵</div>
          <div className="absolute bottom-4 right-6 text-xl">🤝</div>
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, x: 20 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center space-y-6 text-amber-900 z-10"
        >
          <div className="p-4 bg-amber-200 rounded-2xl shadow-md relative">
            <MessageSquare className="h-20 w-20 text-amber-800" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="font-bold text-lg">Hubungi Admin</p>
            <p className="text-sm text-amber-700 font-medium">Kirim screenshot untuk jual ampas</p>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <span>🛡️</span>
              <span>Jaminan pembelian sesuai AI</span>
            </div>
          </div>
        </motion.div>
      </div>
    ),
  },
];

// Coffee-themed Sticky Scroll Component
const CoffeeThemedStickyScroll = ({
  content,
}: {
  content: Array<{
    title: string;
    description: string;
    content: React.ReactNode;
  }>;
}) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / content.length);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <div
      className="relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-3xl p-10 bg-gradient-to-br from-stone-50 to-amber-50"
      ref={ref}
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.4,
                }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-stone-900 mb-4"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.4,
                }}
                transition={{ duration: 0.3 }}
                className="text-lg mt-4 max-w-sm text-stone-700 leading-relaxed"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div className="sticky top-10 hidden h-60 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl border-2 border-stone-200 lg:block">
        {content[activeCard].content}
      </div>
    </div>
  );
};

export default function AmpasAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-orange-50/10">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-stone-50/90 via-stone-100/60 to-transparent">
          {/* Animated Background Ripple Effect */}
          <div className="absolute inset-0 z-0">
            <BackgroundRippleEffect 
              rows={8}
              cols={27}
              cellSize={56}
              borderColor="rgba(217, 119, 6, 0.3)"
              fillColor="rgba(245, 158, 11, 0.15)"
              shadowColor="rgba(154, 52, 18, 0.4)"
              activeColor="rgba(217, 119, 6, 0.5)"
            />
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-stone-50/20 via-transparent to-stone-50/30 pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <AmpasHeroSection />
            </motion.div>
          </div>
          
          {/* Smooth transition gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-stone-100/40 z-[2] pointer-events-none" />
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-stone-100/40 via-stone-50/60 to-amber-50/40 relative">
          <div className="container mx-auto px-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Coffee className="h-4 w-4" />
                <span>Mudah & Cepat</span>
              </div>
              <ViewportTextGenerateEffect
                words="Bagaimana Cara Kerjanya?"
                className="text-4xl md:text-5xl lg:text-6xl mb-6"
                textClassName="text-stone-900 font-bold"
                duration={0.5}
                filter={true}
              />
              <p className="text-xl text-stone-700 max-w-3xl mx-auto">
                Proses analisis yang mudah dan cepat untuk mengubah ampas kopi Anda menjadi peluang bisnis yang menguntungkan
              </p>
            </motion.div>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-white/80 to-amber-50/60 rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden backdrop-blur-sm">
              <CoffeeThemedStickyScroll content={howItWorksContent} />
            </div>
          </div>
          
          {/* Smooth transition gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-stone-50/60 z-[2] pointer-events-none" />
        </section>

        {/* Interactive Showcase Section */}
        <section className="py-12 md:py-16 pb-20 md:pb-24 bg-gradient-to-br from-stone-50/60 via-amber-50/30 to-orange-50/20 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-24 h-24 bg-amber-300 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-300 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-stone-200 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MessageSquare className="h-4 w-4" />
                <span>Jaminan Pembelian</span>
              </div>
              <ViewportTextGenerateEffect
                words="Dapatkan Harga Pasti"
                className="text-4xl md:text-5xl lg:text-6xl mb-6"
                textClassName="text-stone-900 font-bold"
                duration={0.5}
                filter={true}
              />
              <p className="text-xl text-stone-700 max-w-2xl mx-auto">
                Kirim screenshot hasil analisis ke admin Sikupi dan dapatkan jaminan pembelian dengan harga minimal sesuai estimasi AI
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left section - Explanation */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <ViewportTextGenerateEffect
                    words="Cara Mendapatkan Jaminan Harga"
                    className="text-3xl md:text-4xl"
                    textClassName="text-stone-900 font-bold"
                    duration={0.5}
                    filter={true}
                  />
                  <p className="text-lg text-stone-700 leading-relaxed">
                    Sikupi memberikan jaminan pembelian untuk setiap hasil analisis yang dilakukan. 
                    Prosesnya sangat mudah dan transparan.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-800 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-1">Analisis Ampas Kopi</h4>
                      <p className="text-stone-600 text-sm">Gunakan fitur Ampas Analyzer untuk mendapatkan estimasi harga</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-1">Screenshot Hasil</h4>
                      <p className="text-stone-600 text-sm">Ambil screenshot dari halaman hasil analisis lengkap</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-800 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-1">Kirim ke Admin WhatsApp</h4>
                      <p className="text-stone-600 text-sm">Hubungi admin Sikupi melalui WhatsApp dan kirim screenshot</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-800 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-1">Terima Pembayaran</h4>
                      <p className="text-stone-600 text-sm">Admin akan membeli dengan harga minimal sesuai estimasi AI</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <h4 className="font-semibold text-green-900">Jaminan 100%</h4>
                  </div>
                  <p className="text-green-800 text-sm">
                    Kami berkomitmen membeli ampas kopi Anda dengan harga minimal sesuai estimasi AI 
                    sebagai bentuk kepercayaan terhadap teknologi kami.
                  </p>
                </div>
              </motion.div>

              {/* Right section - Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center mb-12 relative z-20"
              >
                <CometCard className="max-w-md w-full">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-stone-200 relative overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-transparent rounded-bl-full opacity-50"></div>
                    
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-sm">
                        <Coffee className="h-7 w-7 text-amber-700" />
                      </div>
                      <div>
                        <ViewportTextGenerateEffect
                          words="Hasil Analisis"
                          className="text-xl"
                          textClassName="text-stone-900 font-bold"
                          duration={0.4}
                          filter={true}
                        />
                        <p className="text-xs text-stone-500">Didukung AI • 3 detik</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 px-4 bg-stone-50 rounded-lg border border-stone-100">
                        <span className="text-stone-600 font-medium">Jenis Kopi</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                          <span className="font-semibold text-stone-900">Robusta</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-stone-50 rounded-lg border border-stone-100">
                        <span className="text-stone-600 font-medium">Tingkat Gilingan</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-semibold text-stone-900">Kasar</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-3 px-4 bg-stone-50 rounded-lg border border-stone-100">
                        <span className="text-stone-600 font-medium">Kondisi</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-stone-900">Kering</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-4 px-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 mt-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-amber-700" />
                          <span className="text-amber-800 font-semibold">Estimasi Harga</span>
                        </div>
                        <span className="text-2xl font-bold text-amber-900">Rp 25.000/kg</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm font-medium">Analisis selesai</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Siap Screenshot</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CometCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-24 md:pt-32 pb-0 relative overflow-hidden">
          {/* Background Ripple Effect - Reverse Fade */}
          <div className="absolute inset-0 z-0">
            <BackgroundRippleEffectReverse 
              rows={16}
              cols={30}
              cellSize={48}
              borderColor="rgba(217, 119, 6, 0.3)"
              fillColor="rgba(245, 158, 11, 0.15)"
              shadowColor="rgba(154, 52, 18, 0.4)"
              activeColor="rgba(217, 119, 6, 0.5)"
            />
          </div>

          {/* Overlay gradient - REVERSED from hero section */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-amber-50/20 via-transparent to-amber-50/30 pointer-events-none" />
          
          {/* Decorative coffee beans */}
          <div className="absolute inset-0 opacity-10 z-[1]">
            <div className="absolute top-16 left-16 w-8 h-8 bg-amber-700 rounded-full transform rotate-12"></div>
            <div className="absolute top-32 right-20 w-6 h-6 bg-orange-600 rounded-full transform -rotate-12"></div>
            <div className="absolute bottom-20 left-24 w-7 h-7 bg-amber-800 rounded-full transform rotate-45"></div>
            <div className="absolute bottom-32 right-16 w-5 h-5 bg-orange-700 rounded-full transform -rotate-30"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-amber-200 shadow-sm">
                  <Coffee className="h-4 w-4" />
                  <span>Revolusi Ampas Kopi</span>
                  <Coffee className="h-4 w-4" />
                </div>
                
                <ViewportTextGenerateEffect
                  words="Mulai Analisis Ampas Kopi Anda!"
                  className="text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight"
                  textClassName="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-clip-text text-transparent font-bold"
                  duration={0.5}
                  filter={true}
                />
                
                <p className="text-xl md:text-2xl text-stone-700 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Teknologi AI canggih siap menganalisis potensi ekonomis ampas kopi Anda dalam hitungan detik
                </p>
              </motion.div>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
              >
                <Link href="/ampas-analyzer/form">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 rounded-2xl"
                  >
                    <Zap className="h-6 w-6 mr-3" />
                    Analisis Sekarang
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </Link>
                
                <div className="flex items-center gap-4 text-stone-600 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">100% Gratis</span>
                  </div>
                  <div className="w-1 h-4 bg-stone-300 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Hasil Instan</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
