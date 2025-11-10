/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        procreate: {
          bg: '#1E1E1E',
          card: '#2D2D2D',
          tag: '#3A3A3A',
          accent: '#4A90E2',
          hover: '#4A5A6A',
        },
      },
    },
  },
  plugins: [],
}
