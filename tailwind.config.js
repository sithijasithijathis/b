/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#111827',
        primary: '#06b6d4', // Cyan
        'primary-hover': '#0891b2',
      },
    },
  },
  plugins: [],
}
