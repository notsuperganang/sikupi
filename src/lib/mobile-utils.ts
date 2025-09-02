"use client";
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window === 'undefined') return;
      
      const isMobileDevice = window.innerWidth < breakpoint;
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setIsMobile(isMobileDevice || isReducedMotion || isMobileUserAgent);
      setIsInitialized(true);
    };

    checkDevice();
    
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    mediaQuery.addEventListener('change', checkDevice);
    motionQuery.addEventListener('change', checkDevice);
    
    return () => {
      mediaQuery.removeEventListener('change', checkDevice);
      motionQuery.removeEventListener('change', checkDevice);
    };
  }, [breakpoint]);

  // Return true during SSR/hydration to prevent flash of heavy animations
  return !isInitialized ? true : isMobile;
}

export function isMobileDevice(breakpoint = 768): boolean {
  if (typeof window === 'undefined') return true; // SSR-safe default
  
  const isMobileWidth = window.innerWidth < breakpoint;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return isMobileWidth || isReducedMotion || isMobileUserAgent;
}

export function shouldDisableAnimations(): boolean {
  return isMobileDevice();
}