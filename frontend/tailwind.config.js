/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cadastre: {
          dark: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          accent: '#3B82F6',
          registered: '#10B981',
          pending: '#F59E0B',
          govt: '#3B82F6',
          commercial: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}
