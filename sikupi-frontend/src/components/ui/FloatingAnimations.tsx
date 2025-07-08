'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingAnimationsProps {
  count?: number;
  icons?: string[];
  className?: string;
}

export default function FloatingAnimations({ 
  count = 6, 
  icons = ['☕'], 
  className = "absolute inset-0 overflow-hidden pointer-events-none" 
}: FloatingAnimationsProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Don't render animations during SSR
  if (!mounted) {
    return <div className={className}></div>;
  }

  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-10"
          initial={{ 
            x: Math.random() * dimensions.width, 
            y: dimensions.height + 100,
            rotate: 0 
          }}
          animate={{ 
            y: -100, 
            rotate: 360,
            x: Math.random() * dimensions.width
          }}
          transition={{ 
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 3,
            ease: "linear"
          }}
        >
          {icons[i % icons.length]}
        </motion.div>
      ))}
    </div>
  );
}