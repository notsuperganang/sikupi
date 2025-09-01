'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Coffee } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { ShinyButton } from '@/components/magicui/shiny-button'

interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
  stats: Array<{
    label: string
    value: string
  }>
}

interface LandingHeroProps {
  intervalMs?: number
  onSlideChange?: (index: number) => void
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/landing-asset/coffe-beans.jpg',
    title: 'Marketplace Ampas Kopi Berkelanjutan',
    subtitle: 'Transformasi limbah kopi menjadi produk bernilai tinggi. Bergabunglah dengan ekosistem ekonomi sirkular kopi di Banda Aceh.',
    stats: [
      { label: 'Produk Kopi', value: '50+' },
      { label: 'Kedai Mitra', value: '25+' },
      { label: 'Banda Aceh', value: '100%' },
      { label: 'CO₂ Berkurang', value: '2.5 Ton' }
    ]
  },
  {
    id: 2,
    image: '/landing-asset/coffe-making-ampas.jpg',
    title: 'Daur Ulang Ampas Kopi Jadi Berkah',
    subtitle: 'Teknologi AI untuk menganalisis kualitas ampas kopi. Dari limbah menjadi briket, pupuk, scrub, dan produk inovatif lainnya.',
    stats: [
      { label: 'Ampas Diolah', value: '500 Kg' },
      { label: 'Analisis AI', value: '99%' },
      { label: 'Produk Turunan', value: '15+' },
      { label: 'Harga Wajar', value: 'Rp 8K/Kg' }
    ]
  },
  {
    id: 3,
    image: '/landing-asset/coffee-barrel.jpg',
    title: 'Solusi Terpadu Ekonomi Kopi Hijau',
    subtitle: 'Platform terintegrasi untuk mengoptimalkan nilai ekonomi ampas kopi dengan standar kualitas terjamin dan pengiriman cepat.',
    stats: [
      { label: 'Kualitas', value: 'Grade A' },
      { label: 'Pengiriman', value: '24 Jam' },
      { label: 'Garansi', value: '100%' },
      { label: 'Rating', value: '4.9/5' }
    ]
  }
]

export function LandingHero({ intervalMs = 5000, onSlideChange }: LandingHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  // Handle slide change
  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index)
    setProgress(0)
    onSlideChange?.(index)
  }, [onSlideChange])

  // Navigation functions
  const goToNext = useCallback(() => {
    handleSlideChange((currentSlide + 1) % slides.length)
  }, [currentSlide, handleSlideChange])

  const goToPrev = useCallback(() => {
    handleSlideChange(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)
  }, [currentSlide, handleSlideChange])

  const goToSlide = useCallback((index: number) => {
    handleSlideChange(index)
  }, [handleSlideChange])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrev()
      } else if (event.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev])

  // Autoplay and progress management
  useEffect(() => {
    if (!isAutoplay || isPaused) return

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          goToNext()
          return 0
        }
        return prev + (100 / (intervalMs / 100))
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [currentSlide, intervalMs, isAutoplay, isPaused, goToNext])

  // Pause/Resume on focus/blur
  useEffect(() => {
    const handleFocus = () => setIsPaused(false)
    const handleBlur = () => setIsPaused(true)

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const currentSlideData = slides[currentSlide]

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideData.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={currentSlideData.image}
              alt={currentSlideData.title}
              fill
              className="object-cover"
              style={{ filter: 'blur(1px)' }}
              priority={currentSlide === 0}
            />
            
            {/* Dark overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideData.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Main Title */}
                <div className="mb-6">
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                    <SparklesText
                      colors={{
                        first: "#8B4513", // Coffee brown
                        second: "#A0522D"  // Sienna brown
                      }}
                      sparklesCount={12}
                      className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight text-amber-800"
                    >
                      {currentSlideData.title}
                    </SparklesText>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl leading-relaxed">
                  {currentSlideData.subtitle}
                </p>

                {/* Stat Pills */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {currentSlideData.stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="backdrop-blur-sm bg-white/10 ring-1 ring-white/20 rounded-full px-4 py-2 text-sm"
                    >
                      <span className="font-bold text-white">{stat.value}</span>
                      <span className="text-gray-200 ml-1">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/register">
                    <ShinyButton 
                      className="bg-white/10 border-white/30 hover:bg-white/20 backdrop-blur-sm px-8 py-3 text-base font-semibold [&>span]:!text-gray-200 hover:[&>span]:!text-white"
                      style={{ "--primary": "rgba(255, 255, 255, 0.8)" } as any}
                    >
                      Daftar Gratis
                    </ShinyButton>
                  </Link>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-amber-600 border-amber-600 text-white hover:bg-amber-700 hover:border-amber-700 font-semibold px-8 py-3 text-base"
                    >
                      <AnimatedShinyText className="text-white font-semibold">
                        Jelajahi Produk Olahan Ampas Kopi
                      </AnimatedShinyText>
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm border border-white/20"
        onClick={goToPrev}
        aria-label="Slide sebelumnya"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm border border-white/20"
        onClick={goToNext}
        aria-label="Slide selanjutnya"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-amber-500' : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Pergi ke slide ${index + 1}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div 
          className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemax={100}
          aria-label="Progress slide otomatis"
        />
        <div className="h-1 bg-black/20 absolute inset-0 -z-10" />
      </div>
    </section>
  )
}
