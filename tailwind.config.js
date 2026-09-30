/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/src/main/assets/**/*.{html,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          text: '#0F172A',
          amber: '#F59E0B',
          amberDark: '#D97706',
          danger: '#DC2626',
          pass: '#16A34A'
        }
      }
    },
  },
  plugins: [],
}
