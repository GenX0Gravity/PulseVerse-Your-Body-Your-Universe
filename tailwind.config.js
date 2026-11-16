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
        midnight: {
          950: '#03050c',
          900: '#070a14',
          850: '#0b1021',
          800: '#101730',
          700: '#1a2444',
          600: '#26345d',
        },
        cosmic: {
          cyan: '#00f2fe',
          teal: '#4facfe',
          violet: '#8a2be2',
          purple: '#a855f7',
          pink: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
        },
        surface: {
          glass: 'rgba(15, 23, 42, 0.65)',
          'glass-border': 'rgba(255, 255, 255, 0.08)',
          'glass-hover': 'rgba(30, 41, 59, 0.75)',
          'glass-light': 'rgba(255, 255, 255, 0.7)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(138, 43, 226, 0.35)',
        'glow-pink': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glass-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-cardiac': 'cardiac 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'breathe-slow': 'breathe 6s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        cardiac: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '15%': { transform: 'scale(1.12)', opacity: '1' },
          '30%': { transform: 'scale(0.98)', opacity: '0.9' },
          '45%': { transform: 'scale(1.05)', opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
