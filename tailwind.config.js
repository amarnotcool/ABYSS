/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: {
          950: "#000308",
          900: "#021024",
          800: "#052659",
          700: "#0A3981",
          600: "#1F509A",
          500: "#4A90E2",
        },
        glow: {
          cyan: "#00E5FF",
          ice: "#7DF9FF",
          mist: "#8ED6FF",
        },
      },
      fontFamily: {
        display: ["'Clash Display'", "'Satoshi'", "system-ui", "sans-serif"],
        body: ["'Satoshi'", "'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.35em",
      },
      animation: {
        "spin-slow": "spin 14s linear infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        "float-y": "floatY 6s ease-in-out infinite",
        drift: "drift 20s ease-in-out infinite",
        sonar: "sonar 3s ease-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        drift: {
          "0%, 100%": { transform: "translateX(0) translateY(0)" },
          "33%": { transform: "translateX(30px) translateY(-20px)" },
          "66%": { transform: "translateX(-20px) translateY(10px)" },
        },
        sonar: {
          "0%": { transform: "scale(0.2)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
