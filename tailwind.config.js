export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // This line allows the documentElement.classList.add('dark') to work
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}