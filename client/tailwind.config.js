/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3A3A3C",
        secondary: "#1C1C1E",
        accent: "#D1D1D6",
        black: "#000000",
        grayDark: "#3A3A3C",
        gray: "#D1D1D6",
        grayLight: "#F2F2F7",
        white: "#FAFAFA",
      },
    },
  },
  plugins: [],
} 