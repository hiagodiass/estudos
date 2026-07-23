/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Base surfaces
        background: "#0B0D10",
        surface: "#14171C",
        "surface-hover": "#191D23",
        border: "#23272E",

        // Text
        foreground: "#E6E8EB",
        muted: "#8B92A0",
        "muted-foreground": "#5D6470",

        // Brand accent (used sparingly — primary actions, active nav)
        accent: {
          DEFAULT: "#34D399",
          hover: "#2BBF89",
          muted: "#34D3991A",
        },

        // Status system — the app's core visual language
        status: {
          pendente: "#6B7280",
          "pendente-muted": "#6B72801A",
          estudando: "#5B8DEF",
          "estudando-muted": "#5B8DEF1A",
          revisao: "#F0A93A",
          "revisao-muted": "#F0A93A1A",
          concluido: "#34D399",
          "concluido-muted": "#34D3991A",
        },

        destructive: "#EF5A5A",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
