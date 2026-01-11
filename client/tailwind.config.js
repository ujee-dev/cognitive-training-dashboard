/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#818cf8",
          DEFAULT: "#4f46e5",
          dark: "#3730a3",
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          600: "#475569",
          900: "#0f172a",
        },
        leafGreen: {
          light: "#6ee7b7",
          DEFAULT: "#10b981",
          dark: "#065f46",
        },
        oliveGreen: {
          light: "#d9f99d",
          DEFAULT: "#84cc16",
          dark: "#3f6212",
        },
        point: "#fbbf24",
      },
      letterSpacing: {
        base: "0.03em",
        ui: "0.05em",
      },
    },
  },
  plugins: [],
}
