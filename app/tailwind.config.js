/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface-0) / <alpha-value>)",
          elevated: "rgb(var(--color-surface-1) / <alpha-value>)",
          raised: "rgb(var(--color-surface-2) / <alpha-value>)",
          overlay: "rgb(var(--color-surface-3) / <alpha-value>)",
          hover: "rgb(var(--color-surface-hover) / <alpha-value>)",
          active: "rgb(var(--color-surface-active) / <alpha-value>)",
        },
 
        // 
        black: {
          DEFAULT: "#000000",
        },
        white: {
          DEFAULT: "#ffffff",
        },
        typography: {
          // DEFAULT: '#b5bdc9',
          //           // subtle: '#94a3b8',
          //           // intense: '#cbd5e1'
          // //  --color-typography
          //           DEFAULT: "rgb(var(--color-text) / <alpha-value>)", // main text
          //           subtle: "rgb(var(--color-typography-low) / <alpha-value>)",
         intense: '#f1f5f9',    // headings / emphasis

          DEFAULT: "rgb(var(--color-text) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-text-subtle) / <alpha-value>)",
          inverse: "rgb(var(--color-text-inverse) / <alpha-value>)",
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          "primary-strong":
            "rgb(var(--color-text-primary-strong) / <alpha-value>)",
          "primary-subtle":
            "rgb(var(--color-text-primary-subtle) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "#f43f5e",
          "-5p": "#f55671",
        },
        success: {
          DEFAULT: "#10b981",
        },
        warning: {
          DEFAULT: "#f59e0b",
        },
        slate: {
          300: "#cbd5e1",
        },
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
          1000: "#0f0e25",
          // 1050: '#0f0e25'
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          lighter: 'rgb(var(--color-primary-lighter) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          darker: 'rgb(var(--color-primary-darker) / <alpha-value>)',
        },
        secondary: {
          // 500: '#ec4899',
          500: "#ff33bb",
        },
        // surface: {
        //   DEFAULT: '#151b2e',
        //   // secondary: '#0d1226'
        //   secondary: '#070913',
        //   'secondary-10': '#0d1226',
        //   // modal:
        //   '-10': '#101523',
        // },
        "surface-border": {
          DEFAULT: "#1e2a4a",
          secondary: "rgba(255, 255, 255, 0.06)",
          // modal:
        },
        spinner: {
          primary: "#6366f1",
          "primary-track": "rgba(99, 102, 241, 0.2)",
          secondary: "#eef2ff",
          "secondary-track": "rgba(255, 255, 255, 0.3)",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
      },
      zIndex: {
        1000: "1000",
      },
      boxShadow: {
        connection: "0 0 5px rgba(16, 185, 129, 0.6)",
      },
      screens: {
        xs: "480px",
        // '3xl': '1920px',
      },
      borderColor: {
        subtle: "rgb(var(--color-border-subtle) / <alpha-value>)",
        DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
        strong: "rgb(var(--color-border-strong) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
