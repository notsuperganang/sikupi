/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sikupi Brand Colors
        'sikupi': {
          50: '#faf8f4',
          100: '#f4f1e8',
          200: '#e8e0d1',
          300: '#d6c8b0',
          400: '#c0ab89',
          500: '#b8956b',
          600: '#8b5a3c',
          700: '#6b4226',
          800: '#4a2f1e',
          900: '#2d1b12',
        },
        'sikupi-green': {
          50: '#f0f4f1',
          100: '#dde8e0',
          200: '#b8d1c0',
          300: '#8fb89f',
          400: '#6b9f7f',
          500: '#4a8660',
          600: '#2d5a3d',
          700: '#1f4029',
          800: '#132815',
          900: '#0a140c',
        },
        // Override default theme colors
        primary: {
          DEFAULT: '#8b5a3c',
          foreground: '#ffffff',
          50: '#faf8f4',
          100: '#f4f1e8',
          200: '#e8e0d1',
          300: '#d6c8b0',
          400: '#c0ab89',
          500: '#b8956b',
          600: '#8b5a3c',
          700: '#6b4226',
          800: '#4a2f1e',
          900: '#2d1b12',
        },
        secondary: {
          DEFAULT: '#6b4226',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#2d5a3d',
          foreground: '#ffffff',
        },
        background: '#f4f1e8',
        foreground: '#4a2f1e',
        muted: {
          DEFAULT: '#e8e0d1',
          foreground: '#6b4226',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#4a2f1e',
        },
        border: '#d6c8b0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['ui-serif', 'Georgia'],
        mono: ['ui-monospace', 'SFMono-Regular'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '475px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}