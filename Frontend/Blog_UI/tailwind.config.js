export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bfd3ff",
          300: "#93b4ff",
          400: "#608aff",
          500: "#3b66f6",
          600: "#2549eb",
          700: "#1d39d0",
          800: "#1e32a8",
          900: "#1e3084",
        },
        canvas: { DEFAULT: "#f4f5f7", dark: "#0b0d12" },
        panel: { DEFAULT: "#ffffff", dark: "#12151c" },
        line: { DEFAULT: "#e7e9ee", dark: "#232835" },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        lift: "0 12px 32px -12px rgba(16, 24, 40, 0.18)",
      },
      borderRadius: {
        xl2: "1.125rem",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        "slide-in-left": "slide-in-left 220ms ease-out",
      },
    },
  },
  plugins: [],
};
