/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        "dark-gray": "#1A1A1A",
        "medium-gray": "#6B6B6B",
        "light-gray": "#F5F5F5",
      },
      fontFamily: {
        sans: ["Inter", "Helvetica", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

