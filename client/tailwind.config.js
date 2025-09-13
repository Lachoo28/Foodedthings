/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryGreen: '#0A8F66',
        darkGreen: '#076B4D',
        lightBackground: '#F8F8F8',
        accentOrange: '#FF8C00',
        accentYellow: '#FFD700',
      },
    },
  },
  plugins: [],
}
