/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#ea2a33",
        "background-light": "#f8f6f6",
        "background-dark": "#211111",
      },
      fontFamily: {
        "display": ["System", "sans-serif"] // Using System font for now as we don't have Public Sans
      }
    },
  },
  plugins: [],
}
