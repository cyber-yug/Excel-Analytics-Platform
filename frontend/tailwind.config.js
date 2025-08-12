/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors to match your current design
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        blue: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
        cyan: {
          500: '#06B6D4',
          600: '#0891B2',
        },
        purple: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        green: {
          500: '#10B981',
          600: '#059669',
        },
        yellow: {
          500: '#F59E0B',
          600: '#D97706',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradientShift 6s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        }
      },
      backgroundSize: {
        '200': '200% 200%',
      }
    },
  },
  plugins: [],
}
