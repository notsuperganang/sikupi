/**
 * Sikupi Custom Color Palette
 * Based on logo color #6b4e3c
 * 
 * This file provides TypeScript references to all custom Sikupi colors
 * Use these for programmatic color access or Tailwind configuration
 */

export const sikupiColors = {
  // Primary brand colors (based on logo #6b4e3c)
  primary: {
    50: '#faf8f6',   // Very light tint
    100: '#f0ebe6',  // Light tint  
    200: '#ddd0c4',  // Light
    300: '#c4ab96',  // Medium light
    400: '#a5836b',  // Medium
    500: '#6b4e3c',  // Base logo color
    600: '#5d4234',  // Medium dark
    700: '#4a3429',  // Dark
    800: '#3d2a20',  // Very dark
    900: '#2f1f18',  // Darkest
    
    // Semantic aliases
    DEFAULT: '#6b4e3c',  // Base color
    light: '#8a6b5a',    // Lighter version
    dark: '#4a3429',     // Darker version
  },

  // Coffee-themed colors
  coffee: {
    light: '#d4a574',    // Light coffee/latte
    medium: '#a67c52',   // Medium coffee
    dark: '#8b4513',     // Dark coffee/espresso
    bean: '#3c2415',     // Coffee bean brown
  },

  // Earth tones for sustainability theme
  earth: {
    sand: '#e6d3b7',     // Sand/beige
    clay: '#bc9a6a',     // Clay brown
    soil: '#5d4e37',     // Rich soil
    forest: '#4a5d3a',   // Forest green
  },

  // UI accent colors
  accent: {
    amber: '#f59e0b',    // Warm amber for CTAs
    orange: '#ea580c',   // Orange for highlights
    green: '#16a34a',    // Green for success/sustainability
    red: '#dc2626',      // Red for errors/warnings
  },

  // Neutral grays that complement brown palette
  gray: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  }
} as const;

/**
 * CSS Custom Property References
 * Use these when you need to reference CSS variables in JavaScript
 */
export const sikupiCSSVars = {
  // Primary colors
  primary: 'var(--sikupi-primary)',
  primaryLight: 'var(--sikupi-primary-light)',
  primaryDark: 'var(--sikupi-primary-dark)',
  
  // Primary scale
  primary50: 'var(--sikupi-primary-50)',
  primary100: 'var(--sikupi-primary-100)',
  primary200: 'var(--sikupi-primary-200)',
  primary300: 'var(--sikupi-primary-300)',
  primary400: 'var(--sikupi-primary-400)',
  primary500: 'var(--sikupi-primary-500)',
  primary600: 'var(--sikupi-primary-600)',
  primary700: 'var(--sikupi-primary-700)',
  primary800: 'var(--sikupi-primary-800)',
  primary900: 'var(--sikupi-primary-900)',
  
  // Coffee colors
  coffeeLight: 'var(--sikupi-coffee-light)',
  coffeeMedium: 'var(--sikupi-coffee-medium)',
  coffeeDark: 'var(--sikupi-coffee-dark)',
  coffeeBean: 'var(--sikupi-coffee-bean)',
  
  // Earth colors
  earthSand: 'var(--sikupi-earth-sand)',
  earthClay: 'var(--sikupi-earth-clay)',
  earthSoil: 'var(--sikupi-earth-soil)',
  earthForest: 'var(--sikupi-earth-forest)',
  
  // Accent colors
  accentAmber: 'var(--sikupi-accent-amber)',
  accentOrange: 'var(--sikupi-accent-orange)',
  accentGreen: 'var(--sikupi-accent-green)',
  accentRed: 'var(--sikupi-accent-red)',
  
  // Gray scale
  gray50: 'var(--sikupi-gray-50)',
  gray100: 'var(--sikupi-gray-100)',
  gray200: 'var(--sikupi-gray-200)',
  gray300: 'var(--sikupi-gray-300)',
  gray400: 'var(--sikupi-gray-400)',
  gray500: 'var(--sikupi-gray-500)',
  gray600: 'var(--sikupi-gray-600)',
  gray700: 'var(--sikupi-gray-700)',
  gray800: 'var(--sikupi-gray-800)',
  gray900: 'var(--sikupi-gray-900)',
} as const;

/**
 * Utility functions for color manipulation
 */
export const colorUtils = {
  /**
   * Get a specific shade from the primary color scale
   */
  getPrimaryShade: (shade: keyof typeof sikupiColors.primary) => {
    return sikupiColors.primary[shade];
  },

  /**
   * Get coffee color by intensity
   */
  getCoffeeColor: (intensity: keyof typeof sikupiColors.coffee) => {
    return sikupiColors.coffee[intensity];
  },

  /**
   * Get earth tone color
   */
  getEarthColor: (type: keyof typeof sikupiColors.earth) => {
    return sikupiColors.earth[type];
  },

  /**
   * Get accent color for UI elements
   */
  getAccentColor: (type: keyof typeof sikupiColors.accent) => {
    return sikupiColors.accent[type];
  },
} as const;

/**
 * Color combinations for common UI patterns
 */
export const colorCombinations = {
  // Button variants
  primaryButton: {
    bg: sikupiColors.primary.DEFAULT,
    hover: sikupiColors.primary[600],
    text: '#ffffff',
  },
  
  secondaryButton: {
    bg: sikupiColors.primary[100],
    hover: sikupiColors.primary[200],
    text: sikupiColors.primary[800],
  },
  
  // Card variants
  primaryCard: {
    bg: sikupiColors.primary[50],
    border: sikupiColors.primary[200],
    text: sikupiColors.primary[800],
  },
  
  // Status colors
  success: {
    bg: '#dcfce7',
    border: sikupiColors.accent.green,
    text: '#166534',
  },
  
  warning: {
    bg: '#fef3c7',
    border: sikupiColors.accent.amber,
    text: '#92400e',
  },
  
  error: {
    bg: '#fee2e2',
    border: sikupiColors.accent.red,
    text: '#991b1b',
  },
} as const;

export type SikupiColor = keyof typeof sikupiColors;
export type SikupiColorShade = keyof typeof sikupiColors.primary;
export type CoffeeColorIntensity = keyof typeof sikupiColors.coffee;
export type EarthColorType = keyof typeof sikupiColors.earth;
export type AccentColorType = keyof typeof sikupiColors.accent;
