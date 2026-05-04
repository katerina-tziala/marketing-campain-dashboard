/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface-0) / <alpha-value>)",
          lift: "rgb(var(--color-surface-0h) / <alpha-value>)",
          elevated: "rgb(var(--color-surface-1) / <alpha-value>)",
          raised: "rgb(var(--color-surface-2) / <alpha-value>)",
          overlay: "rgb(var(--color-surface-3) / <alpha-value>)",
          hover: "rgb(var(--color-surface-hover) / <alpha-value>)",
          active: "rgb(var(--color-surface-active) / <alpha-value>)",
          backdrop: "rgb(var(--color-backdrop) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
          lighter: "rgb(var(--color-primary-lighter) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          darker: "rgb(var(--color-primary-darker) / <alpha-value>)",
          soft: "rgb(var(--color-primary-soft) / <alpha-value>)",
          deep: "rgb(var(--color-primary-deep) / <alpha-value>)",
          deeper: "rgb(var(--color-primary-deeper) / <alpha-value>)",
          muted: "rgb(var(--color-primary-muted) / <alpha-value>)",
          ink: "rgb(var(--color-primary-ink) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          light: "rgb(var(--color-secondary-light) / <alpha-value>)",
          lighter: "rgb(var(--color-secondary-lighter) / <alpha-value>)",
          dark: "rgb(var(--color-secondary-dark) / <alpha-value>)",
          darker: "rgb(var(--color-secondary-darker) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          light: "rgb(var(--color-accent-light) / <alpha-value>)",
          lighter: "rgb(var(--color-accent-lighter) / <alpha-value>)",
          dark: "rgb(var(--color-accent-dark) / <alpha-value>)",
          darker: "rgb(var(--color-accent-darker) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          light: "rgb(var(--color-success-light) / <alpha-value>)",
          lighter: "rgb(var(--color-success-lighter) / <alpha-value>)",
          dark: "rgb(var(--color-success-dark) / <alpha-value>)",
          darker: "rgb(var(--color-success-darker) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          light: "rgb(var(--color-warning-light) / <alpha-value>)",
          lighter: "rgb(var(--color-warning-lighter) / <alpha-value>)",
          dark: "rgb(var(--color-warning-dark) / <alpha-value>)",
          darker: "rgb(var(--color-warning-darker) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          light: "rgb(var(--color-danger-light) / <alpha-value>)",
          lighter: "rgb(var(--color-danger-lighter) / <alpha-value>)",
          dark: "rgb(var(--color-danger-dark) / <alpha-value>)",
          darker: "rgb(var(--color-danger-darker) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          light: "rgb(var(--color-info-light) / <alpha-value>)",
          lighter: "rgb(var(--color-info-lighter) / <alpha-value>)",
          dark: "rgb(var(--color-info-dark) / <alpha-value>)",
          darker: "rgb(var(--color-info-darker) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          faint: "rgb(var(--color-border-faint) / <alpha-value>)",
          subtle: "rgb(var(--color-border-subtle) / <alpha-value>)",
          strong: "rgb(var(--color-border-strong) / <alpha-value>)",
          darker: "rgb(var(--color-border-darker) / <alpha-value>)",
        },
        chart: {
          funnel: {
            impressions: "rgb(var(--chart-funnel-impressions) / <alpha-value>)",
            clicks: "rgb(var(--chart-funnel-clicks) / <alpha-value>)",
            conversions: "rgb(var(--chart-funnel-conversions) / <alpha-value>)",
          },
        },
        typography: {
          DEFAULT: "rgb(var(--color-text) / <alpha-value>)",
          soft: "rgb(var(--color-text-soft) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          subtle: "rgb(var(--color-text-subtle) / <alpha-value>)",
          faint: "rgb(var(--color-text-faint) / <alpha-value>)",
          inverse: "rgb(var(--color-text-inverse) / <alpha-value>)",
          strong: "rgb(var(--color-text-strong) / <alpha-value>)",
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          "primary-strong":
            "rgb(var(--color-text-primary-strong) / <alpha-value>)",
          "primary-subtle":
            "rgb(var(--color-text-primary-subtle) / <alpha-value>)",
          "primary-light":
            "rgb(var(--color-text-primary-light) / <alpha-value>)",
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
      height: {
        29: "464px",
      },
      zIndex: {
        1000: "1000",
        1100: "1100",
      },
      boxShadow: {
        connection: "0 0 4px rgb(var(--color-success) / 0.6)",
      },
      screens: {
        xs: "480px",
        "sticky-header": "1248px",
      },
      borderColor: {
        DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
        faint: "rgb(var(--color-border-faint) / <alpha-value>)",
        subtle: "rgb(var(--color-border-subtle) / <alpha-value>)",
        strong: "rgb(var(--color-border-strong) / <alpha-value>)",
        darker: "rgb(var(--color-border-darker) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
