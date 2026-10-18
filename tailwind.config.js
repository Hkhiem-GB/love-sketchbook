/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7F1E5',
          white: '#FFFDF8',
          card: '#FAF6ED',
          border: '#E3D7C5',
          shadow: '#423730',
        },
        pencil: {
          pink: '#DDA0A5',
          rose: '#C9757C',
          sage: '#A9B99A',
          olive: '#899873',
          gold: '#E1C17A',
          lavender: '#C8B4D4',
          sky: '#B7D0D8',
          graphite: '#5E514B',
          lead: '#91877F',
          dark: '#3A322D',
        }
      },
      fontFamily: {
        hand: ['"Patrick Hand"', '"Caveat"', '"Itim"', 'cursive'],
        serif: ['"Playfair Display"', '"Lora"', 'serif'],
        sans: ['"Quicksand"', '"Nunito"', 'sans-serif'],
      },
      boxShadow: {
        sketch: '2px 3px 0px rgba(94, 81, 75, 0.15)',
        'sketch-hover': '3px 4px 0px rgba(94, 81, 75, 0.25)',
        'sketch-lg': '4px 6px 1px rgba(94, 81, 75, 0.12)',
        'photo': '0 4px 14px rgba(94, 81, 75, 0.16)',
      }
    },
  },
  plugins: [],
};
