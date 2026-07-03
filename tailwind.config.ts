import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "Segoe UI",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        background: "#FFFFFF",
        foreground: "#1F2937",
        muted: {
          DEFAULT: "#F9FAFB",
          foreground: "#6B7280",
        },
        border: "#E5E7EB",
        accent: {
          50: "#EFF6FF",
          100:"#DBEAFE",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        success: { DEFAULT: "#15803D", bg: "#F0FDF4" },
        warning: { DEFAULT: "#B45309", bg: "#FFFBEB" },
        error: { DEFAULT: "#B91C1C", bg: "#FEF2F2" },
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
      },
      spacing: {
        18: "4.5rem",
      },
      boxShadow: {
        dropdown: "0 4px 12px rgba(0,0,0,0.08)",
        modal: "0 8px 24px rgba(0,0,0,0.12)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;