/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

export default {
  content: [
			"./index.html",
			"./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      fontFamail: {
        pretendard: ["Pretendard"],
      },
    },
  },
  plugins: [],
} satisfies Config;