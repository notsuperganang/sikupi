'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const slides = [
  {
    image: '/image-asset/coffee-grounds-others.jpg',
    title: 'Ampas Kopi Berkualitas',
    description: 'Dapatkan ampas kopi terbaik untuk berbagai kebutuhan usaha dan rumah tangga Anda.',
    highlight: 'Kualitas Premium'
  },
  {
    image: '/image-asset/coffee-seed.jpg',
    title: 'Langsung dari Petani',
    description: 'Kami bekerja sama langsung dengan petani kopi untuk memastikan kualitas dan kesegaran.',
    highlight: 'Sumber Terpercaya'
  },
  {
    image: '/image-asset/coffee-seed2.jpeg',
    title: 'Solusi Ramah Lingkungan',
    description: 'Ubah limbah ampas kopi menjadi produk bernilai tinggi untuk masa depan yang berkelanjutan.',
    highlight: 'Eco-Friendly'
  }
]

export function ImageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950">
      {/* Logo */}
      <div className="absolute top-8 left-8 z-10">
        <Image
          src="/sikupi-logo-horizontal-no-bg.png"
          alt="Sikupi Logo"
          width={120}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      {/* Slide Content */}
      <div className="flex h-full flex-col items-center justify-center p-12 text-center">
        <div className="relative mb-8 h-64 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                index === currentSlide ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Text Content */}
        <div className="max-w-md space-y-4">
          <div className="inline-block rounded-full bg-amber-100 dark:bg-amber-900 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
            {slides[currentSlide].highlight}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {slides[currentSlide].title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="mt-8 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 w-8 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-amber-500"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,#8b5a2b_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>
    </div>
  )
}