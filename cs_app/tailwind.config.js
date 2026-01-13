/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'cs-maroon': '#730d32',
        'cs-yellow': '#f7b643',
        'cs-background': '#f8f9fa',
        'cs-maroon-light': '#8b1a42',
        'cs-maroon-dark': '#5a0a27',
      },
    },
  },
  plugins: [],
};
