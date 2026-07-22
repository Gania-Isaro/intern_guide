// This file defines every color, font, size, and spacing value our app
// is allowed to use — pulled directly from the Figma design file, so
// what we build in code matches what's designed.
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"], // not used yet, but ready if we ever add dark mode

  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],

  theme: {
    // The centered content box every page uses
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },

    extend: {
      // COLORS — named by meaning (primary, ink, paper), not by the
      // actual color name, so changing a color later only means
      // editing one value in globals.css, not every component.
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))", // the glow around a focused input/button
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        paper: "hsl(var(--paper))", // light gray-white, used for input backgrounds

        // Text colors — three shades of the same dark green-gray ("ink")
        ink: {
          DEFAULT: "hsl(var(--ink))",             // main text
          secondary: "hsl(var(--ink-secondary))", // slightly lighter text
          muted: "hsl(var(--ink-muted))",         // faded/placeholder text
        },

        // The ONE accent color in the whole design — green. Used for
        // primary buttons, links, and the "verified" badge.
        primary: {
          DEFAULT: "hsl(var(--primary))",
          deep: "hsl(var(--primary-deep))", // a darker shade of the same green
          tint: "hsl(var(--primary-tint))", // a very light background version
          foreground: "hsl(var(--primary-foreground))", // text color on top of primary
        },
        // Used only for "pending" status badges
        pending: {
          DEFAULT: "hsl(var(--pending))",
          tint: "hsl(var(--pending-tint))",
        },
        // Used only for "rejected"/error states
        danger: {
          DEFAULT: "hsl(var(--danger))",
          tint: "hsl(var(--danger-tint))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // FONTS — "display" for headings/buttons, "sans" for body text
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        sans: ["var(--font-nunito-sans)", "system-ui", "sans-serif"],
      },

      // FONT SIZES — matched exactly to the text styles shown in Figma
      fontSize: {
        label: ["13px", { lineHeight: "normal", fontWeight: "600" }],       // form field labels
        body: ["15px", { lineHeight: "24px" }],                              // normal paragraph text
        "card-title": ["16px", { lineHeight: "normal", fontWeight: "500" }], // e.g. company name on a card
        heading: ["28px", { lineHeight: "32px", fontWeight: "600" }],        // section headings
        display: ["52px", { lineHeight: "40px", fontWeight: "600" }],        // big hero text
        badge: ["12.5px", { lineHeight: "normal", fontWeight: "600" }],      // small badge text
      },

      // ROUNDED CORNERS — a different roundness for each type of element
      borderRadius: {
        chip: "8px",      // small pill-shaped elements
        control: "10px",  // buttons and inputs
        card: "16px",     // cards
        modal: "20px",    // popups/dialogs
        full: "999px",    // fully round, used for badges
      },

      // The one soft shadow used everywhere in the design — never a hard/dark shadow
      boxShadow: {
        soft: "0px 12px 32px 0px rgba(24, 36, 32, 0.05)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // ready-made animation classes (used by dialogs/popups)
};

export default config;