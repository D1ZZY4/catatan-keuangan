import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-page": "var(--bg-page)",
        "bg-card": "var(--bg-card)",
        "bg-surface": "var(--bg-surface)",
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.4" }],
        sm: ["14px", { lineHeight: "1.65" }],
        base: ["16px", { lineHeight: "1.65" }],
        lg: ["20px", { lineHeight: "1.4" }],
        xl: ["24px", { lineHeight: "1.4" }],
        "2xl": ["32px", { lineHeight: "1.4" }],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(26, 24, 20, 0.06), 0 4px 12px rgba(26, 24, 20, 0.04)",
        fab: "0 6px 16px rgba(140, 192, 235, 0.45)",
      },
      keyframes: {
        "sheet-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "sheet-in": "sheet-in 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
        "fade-in": "fade-in 0.2s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
