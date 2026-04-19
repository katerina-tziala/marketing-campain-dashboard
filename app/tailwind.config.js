/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { 
        black: {
          DEFAULT: '#000000', 
        },
       white: {
          DEFAULT: '#ffffff', 
        },
        typography: {
          DEFAULT: '#b5bdc9',
          subtle: '#94a3b8',
          intense: '#cbd5e1'
        },
        danger: {
          DEFAULT: '#f43f5e',
          '-5p': '#f55671',
        },
        success: {
          DEFAULT: '#10b981', 
        },
        warning: {
          DEFAULT: '#f59e0b', 
        },
        slate: {
          300: '#cbd5e1',
        },
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          1000: '#0f0e25',
          // 1050: '#0f0e25'
        },
        secondary: { 
          500: '#ec4899', 
        },
        surface: {
          DEFAULT: '#151b2e',
          // secondary: '#0d1226'
          secondary: '#070913',
          'secondary-10': '#0d1226',
          // modal: 
          '-10': '#101523',
        },
        'surface-border': {
          DEFAULT: '#1e2a4a',
          secondary: 'rgba(255, 255, 255, 0.06)'
          // modal: 
        },
        spinner: {
          primary:           '#6366f1',
          'primary-track':   'rgba(99, 102, 241, 0.2)',
          secondary:         '#eef2ff',
          'secondary-track': 'rgba(255, 255, 255, 0.3)',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
      }, 
      zIndex: {
        '1000': '1000', 
      },
      boxShadow: {
        'connection': '0 0 5px rgba(16, 185, 129, 0.6)',
      },
      screens: {
        xs: '480px',
        // '3xl': '1920px',
      },
    },
  },
  plugins: [],
}
