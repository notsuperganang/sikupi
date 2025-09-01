"use client";
import { motion } from 'framer-motion';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { Highlight } from '@/components/ui/hero-highlight';

export function AnimatedHeroSection() {
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
          Majalah{" "}
          <span className="bg-gradient-to-r from-amber-800 via-yellow-800 to-amber-900 bg-clip-text text-transparent">
            Sikupi
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
        Temukan artikel, panduan, dan cerita seputar inovasi pemanfaatan ampas kopi dari{" "}
        <Highlight className="bg-gradient-to-r from-amber-800/30 to-yellow-800/30 dark:from-amber-800/50 dark:to-yellow-800/50 px-2 py-1 rounded-md">
          Aceh
        </Highlight>
        . Baca tentang keberlanjutan dan komunitas lokal.
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
          <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-stone-700 font-medium">Artikel Berkualitas</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-stone-700 font-medium">Tips & Panduan</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200 shadow-sm"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-stone-700 font-medium">Cerita Komunitas</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
