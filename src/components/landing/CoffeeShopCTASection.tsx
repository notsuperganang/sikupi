"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { useIsMobile } from "@/lib/mobile-utils";

export function CoffeeShopCTASection() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Halo admin Sikupi! Saya ingin menjual ampas kopi dari warung/kedai kopi saya. Mohon informasi lebih lanjut mengenai prosedur dan harganya.");
    window.open(`https://wa.me/6285338573726?text=${message}`, '_blank');
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Pattern for Glassmorphism - Same style as CTASection */}
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
{isMobile ? (
            <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-serif leading-tight text-amber-800">
              <div className="block">Punya Warung Kopi?</div>
              <div className="block">Jual Ampas Kopi Anda</div>
              <div className="block">ke Sikupi!</div>
            </div>
          ) : (
            <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-serif leading-tight text-amber-800">
              <SparklesText
                colors={{
                  first: "#8B4513", // Coffee brown
                  second: "#A0522D"  // Sienna brown
                }}
                sparklesCount={6}
                className="block"
              >
                Punya Warung Kopi?
              </SparklesText>
              <SparklesText
                colors={{
                  first: "#8B4513", // Coffee brown
                  second: "#A0522D"  // Sienna brown
                }}
                sparklesCount={6}
                className="block"
              >
                Jual Ampas Kopi Anda
              </SparklesText>
              <SparklesText
                colors={{
                  first: "#8B4513", // Coffee brown
                  second: "#A0522D"  // Sienna brown
                }}
                sparklesCount={6}
                className="block"
              >
                ke Sikupi!
              </SparklesText>
            </div>
          )}
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto">
            Dapatkan penghasilan tambahan dari ampas kopi yang biasanya terbuang. Kami akan membeli ampas kopi berkualitas dari warung dan kedai kopi Anda dengan harga yang menguntungkan. Bersama-sama kita wujudkan ekonomi sirkular yang berkelanjutan.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={handleWhatsAppClick}
              className="group relative inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-xl px-10 py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* WhatsApp Icon */}
              <svg 
                className="relative z-10 w-6 h-6" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              
              <span className="relative z-10">Hubungi Admin Sekarang</span>
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