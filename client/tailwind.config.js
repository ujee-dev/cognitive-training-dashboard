/** @type {import('tailwindcss').Config} */
export default {
  content: [
			"./index.html",
			"./src/**/*.{html,js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        // 브랜드 메인 컬러 (Indigo 계열)
        brand: {
          light: "#818cf8", // 400
          DEFAULT: "#4f46e5", // 600 (메인)
          dark: "#3730a3", // 800
        },
        // 배경 및 텍스트용 (Slate 계열)
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          600: "#475569",
          900: "#0f172a",
        },
        // 강조색 (필요 시)
        point: "#fbbf24", // Yellow-400
      },
    },
  },
  plugins: [],
}
