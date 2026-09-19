/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B132B',
          midnight: '#1C2541',
          slate: '#3A506B',
          cyan: '#06B6D4',
          electric: '#00F0FF',
          blue: '#2563EB',
          canvas: '#F0F4F8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 20px -5px rgba(37, 99, 235, 0.35)',
      }
    },
  },
  plugins: [],
}
