"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { TypewriterShinyButton } from '@/components/magicui/typewriter-shiny-button';
import { Highlight } from '@/components/ui/hero-highlight';

interface AmpasHeroSectionProps {
  disableCTA?: boolean;
}

export function AmpasHeroSection({ disableCTA = false }: AmpasHeroSectionProps) {
  return (
    <motion.div 
      className="max-w-5xl mx-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
    >
      {/* Title with SparklesText */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <SparklesText
          colors={{
            first: "#8B4513", // Coffee brown
            second: "#A0522D"  // Sienna brown
          }}
          sparklesCount={15}
          className="text-4xl md:text-6xl font-bold font-serif text-amber-900 leading-tight"
        >
          Ampas{" "}
          <span className="bg-gradient-to-r from-amber-800 via-yellow-800 to-amber-900 bg-clip-text text-transparent">
            Analyzer
          </span>
        </SparklesText>
      </motion.div>
      
      {/* Divider Line */}
      <motion.div 
        className="w-32 h-0.5 bg-gradient-to-r from-amber-700 to-yellow-800 mx-auto mb-8"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 128, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
      />
      
      {/* Subtitle */}
      <motion.p 
        className="text-xl font-medium text-stone-700 max-w-3xl mx-auto mb-2 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        Analisis cerdas untuk ampas kopi Anda dengan{" "}
        <Highlight className="bg-gradient-to-r from-amber-800/30 to-yellow-800/30 dark:from-amber-800/50 dark:to-yellow-800/50 px-2 py-1 rounded-md">
          teknologi AI
        </Highlight>
        . Temukan potensi dan nilai ekonomis ampas kopi secara instan.
      </motion.p>
      
      {/* Trust Chips */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-stone-700 font-medium">AI Powered</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-stone-700 font-medium">Instant Analysis</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-stone-700 font-medium">Accurate Results</span>
        </motion.div>
      </motion.div>
      
      {/* Typewriter Shiny Button */}
      {!disableCTA && (
        <motion.div 
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <Link href="/ampas-analyzer/form">
            <TypewriterShinyButton 
              texts={[]}
              staticText="Mulai Analisis Sekarang"
              useRobotsIcon={true}
              permanentGlow={true}
            />
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
