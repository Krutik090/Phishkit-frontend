/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css" // ← include .css files if you want to use @apply in them
  ],
  corePlugins: {
  preflight: false, // disables Tailwind's CSS reset
}


};


