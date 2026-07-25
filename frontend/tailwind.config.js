/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        card: 'var(--bg-card)',
        border: 'var(--border-color)',
        champagneGold: '#f3d375',
        sunsetCoral: '#ff5e62',
        vermilionOrange: '#ff8c42',
        mintEmerald: '#10b981'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px rgba(243, 211, 117, 0.35)',
        'glow-coral': '0 0 25px rgba(255, 94, 98, 0.3)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
