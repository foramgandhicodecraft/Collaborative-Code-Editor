/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        // Dark theme surfaces
        surface: {
          50:  "#f8fafc",
          100: "#1e2430",
          200: "#252d3d",
          300: "#2d3748",
          400: "#374151",
          500: "#4b5563",
        },
        brand: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease",
        "slide-up": "slideUp 0.25s ease",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp:   { "0%": { opacity: 0, transform: "translateY(8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
};
