/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08090b",
          900: "#0e1014",
          850: "#13161c",
          800: "#1a1e26",
          700: "#262a35",
          600: "#3a3f4d",
          500: "#5a6072",
          400: "#8a8fa0",
          300: "#b4b8c4",
          200: "#d6d8df",
          100: "#eceef2",
        },
        ember: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(249,115,22,0.4), 0 8px 24px -8px rgba(249,115,22,0.4)",
      },
    },
  },
  plugins: [],
};
