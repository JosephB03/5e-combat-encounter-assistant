/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'dnd-red': '#c0392b',
        'dnd-red-light': '#e74c3c',
        'dnd-dark': '#1a1a2e',
        'dnd-darker': '#10192d',
        'dnd-panel': '#242527',
        'dnd-parchment': '#f5f0e8',
        'dnd-parchment-dark': '#e8dfc8',
        'dnd-gold': '#c9ad6a',
        'dnd-gold-dark': '#a08840',
        'dnd-brown': '#4a2e1e',
        'dnd-text': '#d4c5a9',
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        body: ['"Lato"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'dnd': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'dnd-inset': 'inset 0 1px 3px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
