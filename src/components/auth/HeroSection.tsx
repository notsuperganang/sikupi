'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const slides = [
  {
    image: '/image-asset/coffee-grounds-others.jpg',
    title: 'Jelajahi Peluang Ampas Kopi Bersama Kami',
    description: 'Temukan berbagai produk ampas kopi berkualitas tinggi, solusi ramah lingkungan, dan peluang bisnis yang menguntungkan.',
    features: ['100+ Produk', 'Kualitas Premium', 'Ramah Lingkungan']
  },
  {
    image: '/image-asset/coffee-seed.jpg',
    title: 'Transformasi Limbah Menjadi Emas Hijau',
    description: 'Bergabunglah dengan revolusi daur ulang ampas kopi yang memberikan nilai ekonomi dan menjaga kelestarian lingkungan.',
    features: ['Daur Ulang', 'Nilai Ekonomi', 'Inovasi Berkelanjutan']
  },
  {
    image: '/image-asset/coffee-seed2.jpeg',
    title: 'Partner Terpercaya untuk Bisnis Anda',
    description: 'Dari petani kopi hingga industri kreatif, kami menyediakan ampas kopi terbaik untuk mendukung kesuksesan bisnis Anda.',
    features: ['Partner Terpercaya', 'Supply Chain', 'Dukungan Bisnis']
  }
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-cover"
              priority={currentSlide === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Image
              src="/sikupi-logo-seed.png"
              alt="Sikupi"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </div>
          <span className="text-xl font-bold text-white">Sikupi</span>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-lg space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-4xl lg:text-5xl font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                className="text-lg text-white/90 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {slides[currentSlide].description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feature Cards */}
        <motion.div 
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {slides[currentSlide].features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              className="rounded-xl bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-medium text-white border border-white/20 hover:bg-white/20 transition-colors cursor-default"
            >
              {feature}
            </motion.div>
          ))}
        </motion.div>

        {/* Slide Indicators */}
        <motion.div 
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 w-8 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}