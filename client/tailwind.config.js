/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#80a0ff',
          500: '#4d70ff',
          600: '#1a3eff',
          700: '#0022cc',
          800: '#001799',
          900: '#000c66',
        }
      }
    },
  },
  plugins: [],
}
