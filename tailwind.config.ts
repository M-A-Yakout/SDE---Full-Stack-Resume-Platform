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
        luxury: {
          50: "#F8FAFC",    // Light text
          100: "#F1F5F9",   // Light background
          200: "#E2E8F0",   // Light border
          300: "#C4B5FD",   // Accent (violet)
          400: "#94A3B8",   // Secondary text
          500: "#64748B",   // Muted text
          600: "#475569",   // Darker text
          700: "#334155",   // Dark background
          800: "#1E293B",   // Primary dark
          900: "#0F172A",   // Background dark
          gold: "#D4AF37",  // Luxury gold
          silver: "#C0C0C0", // Luxury silver
          bronze: "#CD7F32", // Luxury bronze
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
