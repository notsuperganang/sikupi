import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Coffee-inspired brand colors
        primary: {
          50: '#FDF8F3',
          100: '#FAEEE0',
          200: '#F3D5B0',
          300: '#E8B881',
          400: '#D89C52',
          500: '#8B4513', // Main brand brown
          600: '#7A3A10',
          700: '#68300E',
          800: '#57260B',
          900: '#451C09',
          950: '#2F1306',
        },
        secondary: {
          50: '#FDFCF8',
          100: '#FAF6E8',
          200: '#F5EDD5',
          300: '#E8D7B8',
          400: '#D2B48C', // Light coffee/cream
          500: '#C4A676',
          600: '#B8985F',
          700: '#A08549',
          800: '#8A7240',
          900: '#6B5932',
          950: '#4A3E22',
        },
        accent: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#228B22', // Sustainability green
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        warm: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF8C00', // Energy orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        neutral: {
          50: '#FEFEFE',
          100: '#F5F5DC', // Cream white
          200: '#F0F0E8',
          300: '#E8E8DC',
          400: '#D4D4C8',
          500: '#A3A399',
          600: '#8B8B82',
          700: '#6B6B64',
          800: '#52524D',
          900: '#3A3A36',
          950: '#2F1B14', // Dark roast
        },
        // Status colors
        success: {
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          500: '#EF4444',
          600: '#DC2626',
        },
        info: {
          500: '#3B82F6',
          600: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(139, 69, 19, 0.1)',
        'medium': '0 4px 16px 0 rgba(139, 69, 19, 0.15)',
        'large': '0 8px 32px 0 rgba(139, 69, 19, 0.2)',
        'glow': '0 0 20px rgba(139, 69, 19, 0.3)',
      },
      backgroundImage: {
        'gradient-coffee': 'linear-gradient(135deg, #8B4513 0%, #D2B48C 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FF8C00 0%, #228B22 100%)',
        'gradient-neutral': 'linear-gradient(135deg, #F5F5DC 0%, #E8E8DC 100%)',
      }
    },
  },
  plugins: [],
};

export default config;