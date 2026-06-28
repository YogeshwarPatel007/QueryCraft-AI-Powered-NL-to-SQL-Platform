/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#FFFFFF",
        surface: "#F8F9FC",
        "surface-hover": "#F1F3F9",
        surface2: "#EEF0F6",
        line: "#E2E5EB",
        accent: "#6366F1",
        "accent-hover": "#4F46E5",
        accent2: "#818CF8",
        "accent-light": "#EEF2FF",
        teal: "#10B981",
        "teal-light": "#ECFDF5",
        text: "#1A1D26",
        "text-secondary": "#374151",
        muted: "#6B7280",
        danger: "#EF4444",
        "danger-light": "#FEF2F2",
        warning: "#F59E0B",
        "warning-light": "#FFFBEB",
        info: "#3B82F6",
        "info-light": "#EFF6FF",
      },
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        "elevation-1": "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "elevation-2": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "elevation-3": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        "elevation-4": "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
        glow: "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.2)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideIn: {
          "0%": { opacity: 0, transform: "translateX(16px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        blink: {
          "0%, 50%": { opacity: 1 },
          "51%, 100%": { opacity: 0 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "toast-in": {
          "0%": { opacity: 0, transform: "translateY(-12px) scale(0.95)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "toast-out": {
          "0%": { opacity: 1, transform: "translateY(0) scale(1)" },
          "100%": { opacity: 0, transform: "translateY(-12px) scale(0.95)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out forwards",
        fadeIn: "fadeIn 0.4s ease-out forwards",
        slideIn: "slideIn 0.4s ease-out forwards",
        slideDown: "slideDown 0.3s ease-out forwards",
        blink: "blink 1s step-end infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
        "gradient-x": "gradient-x 3s ease infinite",
        "spin-slow": "spin-slow 1.5s linear infinite",
        "toast-in": "toast-in 0.3s ease-out forwards",
        "toast-out": "toast-out 0.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};