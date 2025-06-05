import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        milk: {
          white: "#FFFFFF",
          cream: "#F8F5F0",
          light: "#F0EBE3",
          medium: "#E7E0D4",
          dark: "#D8CFC2",
          text: {
            light: "#8A7F72",
            DEFAULT: "#5A4F45",
            dark: "#3A2F25",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "milk-sm": "0 2px 8px rgba(216, 207, 194, 0.08), 0 2px 4px rgba(216, 207, 194, 0.03)",
        "milk-md": "0 4px 16px rgba(216, 207, 194, 0.12), 0 2px 8px rgba(216, 207, 194, 0.06)",
        "milk-lg": "0 8px 24px rgba(216, 207, 194, 0.15), 0 4px 12px rgba(216, 207, 194, 0.1)",
        "milk-xl": "0 12px 32px rgba(216, 207, 194, 0.18), 0 8px 20px rgba(216, 207, 194, 0.12)",
        "milk-inner": "inset 0 1px 4px rgba(216, 207, 194, 0.1)",
        "milk-glow": "0 0 16px rgba(216, 207, 194, 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(216, 207, 194, 0.2)" },
          "50%": { boxShadow: "0 0 16px rgba(216, 207, 194, 0.5)" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 3s infinite ease-in-out",
        float: "float 6s infinite ease-in-out",
        glow: "glow 3s infinite ease-in-out",
        "rotate-slow": "rotate-slow 12s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
      backgroundImage: {
        "milk-gradient": "linear-gradient(135deg, #FFFFFF, #F0EBE3)",
        "milk-gradient-dark": "linear-gradient(135deg, #F8F5F0, #E7E0D4)",
        "milk-gradient-light": "linear-gradient(135deg, #FFFFFF, #F8F5F0)",
        "milk-gradient-warm": "linear-gradient(135deg, #E7E0D4, #F0EBE3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

