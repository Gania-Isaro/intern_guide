// This file tells Tailwind CSS what colors, fonts, sizes and spacing
// our whole app is allowed to use. Instead of typing random values like
// "16px" or "#1D4ED8" everywhere, every component pulls from here.
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // dark mode can be turned on later by adding a "dark" class — not used yet

  // Tells Tailwind which files to scan for class names like "bg-primary"
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],

  theme: {
    // The "container" is the centered content box every page uses,
    // so pages don't stretch edge-to-edge on a wide screen.
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px", // max width on very large screens
      },
    },

    extend: {
      // COLORS — named by what they mean (primary, success, warning...)
      // not by the actual color (blue, green...), so if we ever change
      // the color later, we only edit it in ONE place (globals.css).
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))", // the glow around a focused input/button
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))", // main text color

        primary: {
          DEFAULT: "hsl(var(--primary))", // main brand blue
          foreground: "hsl(var(--primary-foreground))", // text color ON TOP of primary
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // quiet background, e.g. light gray box
          foreground: "hsl(var(--muted-foreground))", // quiet gray text
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // used ONLY for "verified" / approved things — keeps its meaning consistent
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        // used for "pending" / not-yet-verified things
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // used for errors, delete buttons, rejected reviews
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },

      // FONTS — "display" = headings, "sans" = normal body text
      fontFamily: {
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },

      // FONT SIZES — a fixed scale so every heading/paragraph on the
      // site uses one of these sizes, instead of random custom sizes.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],        // 12px — tiny captions
        sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px — labels
        base: ["1rem", { lineHeight: "1.5rem" }],       // 16px — normal body text
        lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px — card titles
        "2xl": ["1.5rem", { lineHeight: "2rem" }],      // 24px — section headings
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px — page titles
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px — big hero heading
      },

      // SPACING — named shortcuts for common gaps/padding, so we write
      // "gap-md" instead of guessing a random pixel number every time.
      spacing: {
        xs: "0.25rem",  // 4px
        sm: "0.5rem",   // 8px
        md: "1rem",     // 16px
        lg: "1.5rem",   // 24px
        xl: "2rem",     // 32px
        "2xl": "3rem",  // 48px
        "3xl": "4rem",  // 64px
      },

      // Rounded corners — small/medium/large versions of one base value
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // adds ready-made animation classes (used by the Dialog)
};

export default config;

