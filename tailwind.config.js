// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}", // Combined and simplified
  ],
  corePlugins: {
    preflight: false,
  }
};