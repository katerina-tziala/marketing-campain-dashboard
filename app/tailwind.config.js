/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'panel-text': '#b5bdc9',
        danger: {
          DEFAULT: '#f43f5e',
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
        },
        spinner: {
          primary:           '#6366f1',
          'primary-track':   'rgba(99, 102, 241, 0.2)',
          secondary:         '#ffffff',
          'secondary-track': 'rgba(255, 255, 255, 0.3)',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
      },
    },
  },
  plugins: [],
}
