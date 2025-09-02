"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { SparklesText } from "@/components/magicui/sparkles-text";

// Mock data for Sikupi tracker
const mockStats = [
  {
    value: 12.5,
    unit: "ton",
    label: "Ampas Kopi Terserap",
    suffix: "",
    color: "text-amber-600"
  },
  {
    value: 420,
    unit: "",
    label: "Pesanan Selesai",
    suffix: "+",
    color: "text-green-600"
  },
  {
    value: 35,
    unit: "",
    label: "Mitra UMKM & Industri",
    suffix: "",
    color: "text-blue-600"
  },
  {
    value: 96,
    unit: "jt",
    label: "Nilai Ekonomi Tercipta",
    suffix: "",
    prefix: "Rp ",
    color: "text-emerald-600"
  },
  {
    value: 1.8,
    unit: "ton CO₂e",
    label: "Emisi Dihindari (estimasi)",
    suffix: "",
    color: "text-teal-600"
  },
  {
    value: 9,
    unit: "",
    label: "Kota/Kabupaten Terlayani",
    suffix: "",
    color: "text-indigo-600"
  }
];

// Hook for count-up animation
function useCountUp(target: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(target * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration, shouldStart]);

  return count;
}

// Circular Progress Gauge Component
function CircularGauge({ percentage = 75 }: { percentage?: number }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gaugeRef, { once: true });
  
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setAnimatedPercentage(percentage);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView, percentage]);

  const circumference = 2 * Math.PI * 120;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div ref={gaugeRef} className="relative">
      <motion.div 
        className="relative w-80 h-80 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-200/30 rounded-full blur-2xl"></div>
        
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="120"
            stroke="#f3f4f6"
            strokeWidth="12"
            fill="transparent"
            className="drop-shadow-sm"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="120"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            className="drop-shadow-lg"
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-6xl font-bold text-amber-800 mb-2"
          >
            {Math.round(animatedPercentage)}%
          </motion.div>
          <div className="text-sm text-amber-700 font-medium">
            Potensi Daur Ulang<br />Ampas Kopi
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Stat Card Component
function StatCard({ stat, index }: { stat: typeof mockStats[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true });
  const animatedValue = useCountUp(stat.value, 2000 + (index * 200), isInView);

  const formatValue = (value: number) => {
    if (stat.label === "Nilai Ekonomi Tercipta") {
      return Math.round(value);
    }
    if (stat.unit === "/5") {
      return value.toFixed(1);
    }
    if (value % 1 === 0) {
      return Math.round(value);
    }
    return value.toFixed(1);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20">
        {/* Enhanced glassmorphism glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-100/30 to-orange-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
        
        <div className="relative z-10">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xs text-amber-700">{stat.prefix}</span>
            <span className={cn("text-3xl font-bold", stat.color)}>
              {formatValue(animatedValue)}
            </span>
            <span className="text-lg text-gray-600">{stat.unit}</span>
            <span className="text-lg text-gray-600">{stat.suffix}</span>
          </div>
          <p className="text-sm text-amber-800/80 font-medium leading-tight">
            {stat.label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function SikupiTracker() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  const handleCTAClick = () => {
    // Replace with actual admin WhatsApp number
    const adminNumber = "6285277734430"; // Example admin number
    const message = encodeURIComponent("Halo! Saya ingin bergabung dengan Sikupi untuk berkontribusi dalam ekonomi sirkular ampas kopi.");
    window.open(`https://wa.me/${adminNumber}?text=${message}`, '_blank');
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8"
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

      <div className="relative z-10 py-4 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Left: Copy Block */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight text-amber-800 mb-4">
              <SparklesText
                colors={{
                  first: "#8B4513", // Coffee brown
                  second: "#A0522D"  // Sienna brown
                }}
                sparklesCount={4}
                className="block"
              >
                Dampak Sikupi untuk
              </SparklesText>
              <SparklesText
                colors={{
                  first: "#8B4513", // Coffee brown
                  second: "#A0522D"  // Sienna brown
                }}
                sparklesCount={4}
                className="block"
              >
                Ekonomi Sirkular
              </SparklesText>
            </div>
            
            <p className="text-lg text-neutral-600 leading-relaxed max-w-lg">
              Sikupi menjembatani petani dan pelaku industri untuk mengubah ampas kopi menjadi nilai — mengurangi emisi, menghemat sumber daya, dan menggerakkan ekonomi lokal.
            </p>
          </motion.div>

          {/* Right: Circular Gauge */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <CircularGauge percentage={75} />
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockStats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}