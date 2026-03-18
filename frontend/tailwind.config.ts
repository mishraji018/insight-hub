import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        muted: 'var(--muted)',
        text: 'var(--text)',

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--text)",
        },
        secondary: {
          DEFAULT: "var(--surface2)",
          foreground: "var(--text)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'card':    '0 10px 25px rgba(0,0,0,0.08)',
        'card-hover': '0 15px 35px rgba(0,0,0,0.12)',
        'glow':    '0 0 20px -5px var(--accent)',
        'glow-sm': '0 0 12px -4px var(--accent)',
        'glow-lg': '0 0 32px -6px var(--accent)',
        'glow-success': '0 0 20px -5px var(--success)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "chart-draw": {
          from: { opacity: "0", transform: "scaleY(0.85) translateY(8px)" },
          to:   { opacity: "1", transform: "scaleY(1) translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px 0px var(--accent)" },
          "50%":      { boxShadow: "0 0 20px 4px var(--accent)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        "sun-pulse": {
          "0%, 100%": { filter: "drop-shadow(0 0 20px #fbbf24)", transform: "scale(1)" },
          "50%": { filter: "drop-shadow(0 0 40px #fbbf24)", transform: "scale(1.05)" },
        },
        "moon-float": {
          "0%, 100%": { transform: "translateY(0) rotate(-5deg)", filter: "drop-shadow(0 0 15px #94a3b8)" },
          "50%": { transform: "translateY(-15px) rotate(5deg)", filter: "drop-shadow(0 0 30px #cbd5e1)" },
        },
        "border-chase": {
          "100%": { transform: "rotate(360deg)" },
        }
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in-up":      "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":         "fade-in 0.4s ease-out forwards",
        "slide-in-left":   "slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":         "shimmer 1.6s ease-in-out infinite",
        "chart-draw":      "chart-draw 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in":        "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-pulse":      "glow-pulse 2s ease-in-out infinite",
        "spin-slow":       "spin-slow 3s linear infinite",
        "bounce-subtle":   "bounce-subtle 1.5s ease-in-out infinite",
        "sun-pulse":       "sun-pulse 4s ease-in-out infinite",
        "moon-float":      "moon-float 6s ease-in-out infinite",
        "border-chase":    "border-chase 4s linear infinite",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
