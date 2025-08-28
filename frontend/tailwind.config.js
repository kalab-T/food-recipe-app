/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <-- Add this line
  content: [
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}', // Adjust if necessary
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
