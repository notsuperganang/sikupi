'use client';

import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-coffee rounded-full mb-4 shadow-large"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Coffee className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-semibold text-neutral-700 mb-2">Loading Sikupi</h2>
        <p className="text-neutral-600">Preparing your sustainable marketplace...</p>
      </motion.div>
    </div>
  );
}