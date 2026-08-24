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
        // Sophisticated luxury color palette
        'primary': {
          50: '#fdfdf9',
          100: '#faf9f2',
          200: '#f3f1e1',
          300: '#e8e4c7',
          400: '#d9d2a0',
          500: '#c7b876',
          600: '#b5a057',
          700: '#9e8948',
          800: '#82703d',
          900: '#6b5d34',
          950: '#3d341b',
        },
        'luxury': {
          'champagne': '#F7E7CE',
          'gold': '#D4AF37',
          'pearl': '#F8F6F0',
          'charcoal': '#2C2C2C',
          'platinum': '#E5E4E2',
          'rose-gold': '#E8B4B8',
          'emerald': '#355E3B',
          'ruby': '#722F37',
          'sapphire': '#1C2B4A',
          'diamond': '#F0F8FF',
        },
        'neutral': {
          'warm': {
            50: '#fdfcfa',
            100: '#faf8f4',
            200: '#f4f1ea',
            300: '#ebe6d9',
            400: '#ddd5c0',
            500: '#cbbfa4',
            600: '#b5a085',
            700: '#9c896d',
            800: '#7f6f5b',
            900: '#67594a',
            950: '#362f25',
          }
        },
        // Legacy colors for backwards compatibility (gradually remove)
        'sapphire': '#1C2B4A',
        'ruby': '#722F37', 
        'emerald': '#355E3B',
        'golden': '#D4AF37',
      },
      fontFamily: {
        'heading': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'luxury': ['Cormorant Garamond', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'luxury-lg': '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)',
        'luxury-xl': '0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 12px rgba(0, 0, 0, 0.15)',
        'inner-light': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
      gradientColorStops: {
        'luxury-gold': '#D4AF37',
        'luxury-champagne': '#F7E7CE',
        'luxury-pearl': '#F8F6F0',
      }
    },
  },
  plugins: [],
} 