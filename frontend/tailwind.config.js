/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        'lexend-deca': ['"Lexend Deca"', 'system-ui', 'sans-serif'],
        lexend: ['Lexend', 'system-ui', 'sans-serif'],
        karantina: ['Karantina', 'system-ui', 'sans-serif'],
        workSans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        jost: ['Jost', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        lato: ['Lato', 'system-ui', 'sans-serif'],
        bengali: ['"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#F3AC08',
          50: '#FFFCF6',
          100: '#FFF6DD',
          200: '#FFF5DE',
          300: '#FDEABF',
          400: '#F5B622',
          500: '#F3AC08',
          600: '#ED8E22',
          700: '#D47C1A',
          800: '#92400E',
          900: '#594226',
        },
        ink: {
          DEFAULT: '#111827',
          900: '#0F172A',
          800: '#1E293B',
          700: '#213130',
          600: '#222939',
          500: '#1A1F36',
        },
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        'pulse-glow': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(243,172,8,0.45)' }, '50%': { boxShadow: '0 0 0 12px rgba(243,172,8,0)' } },
        scroll: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        float: 'float 6s ease-in-out infinite',
        fadeIn: 'fadeIn .4s ease-out both',
        'pulse-glow': 'pulse-glow 2s infinite',
        scroll: 'scroll 30s linear infinite',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
