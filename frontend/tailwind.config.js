/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zoeti: {
          mint: '#D1E8E2',
          'mint-soft': '#E5F3EF',
          'mint-deep': '#B7DAD1',
          bg: '#F7FCFA',
          plum: '#4A2040',
          'plum-light': '#68325B',
          'plum-dark': '#32132B',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        zoeti: '0 14px 38px -10px rgba(74, 32, 64, 0.10)',
        'zoeti-lg': '0 22px 50px -12px rgba(74, 32, 64, 0.16)',
      },
    },
  },
  plugins: [],
};

