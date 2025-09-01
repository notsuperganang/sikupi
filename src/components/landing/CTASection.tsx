"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { useRouter } from "next/navigation";

export function CTASection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  const handleCTAClick = () => {
    router.push('/products');
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Pattern for Glassmorphism - Same as other sections */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 bg-amber-200 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-32 right-32 w-96 h-96 bg-orange-200 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -15, 0],
            y: [0, 10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
        ></motion.div>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-serif leading-tight text-amber-800">
            <SparklesText
              colors={{
                first: "#8B4513", // Coffee brown
                second: "#A0522D"  // Sienna brown
              }}
              sparklesCount={6}
              className="block"
            >
              Mulai Gunakan Produk
            </SparklesText>
            <SparklesText
              colors={{
                first: "#8B4513", // Coffee brown
                second: "#A0522D"  // Sienna brown
              }}
              sparklesCount={6}
              className="block"
            >
              Terbarukan, Selamatkan
            </SparklesText>
            <SparklesText
              colors={{
                first: "#8B4513", // Coffee brown
                second: "#A0522D"  // Sienna brown
              }}
              sparklesCount={6}
              className="block"
            >
              Bumi Hari Ini
            </SparklesText>
          </div>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto">
            Bergabunglah dalam gerakan ekonomi sirkular dengan memilih produk berkelanjutan dari ampas kopi. Setiap pembelian Anda berkontribusi untuk masa depan yang lebih hijau.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={handleCTAClick}
              className="group relative inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xl px-10 py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              <span className="relative z-10">Jelajahi Produk</span>
              <svg 
                className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}