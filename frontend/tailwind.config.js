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
        fintech: {
          dark: '#0F172A',
          surface: '#1E293B',
          primary: '#10B981',
          muted: '#64748B',
          accent: '#10B981',
          accentHover: '#059669',
          light: '#F8FAFC',
          card: '#1E293B',
          border: 'rgba(255,255,255,0.08)',
          danger: '#EF4444',
          warning: '#F59E0B',
          info: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-fintech': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981, #6ee7b7)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-emerald-lg': '0 0 40px rgba(16, 185, 129, 0.5)',
        'glass': '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease both',
        'slide-left': 'slide-in-left 0.3s ease both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      borderColor: {
        'glass': 'rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
