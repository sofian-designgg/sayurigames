/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sayuri: {
          pink: '#f8b4c4',
          rose: '#fce4ec',
          dark: '#c2185b',
          manga: '#f48fb1',
        },
      },
      fontFamily: {
        manga: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': 'url("/background.png")',
      },
    },
  },
  plugins: [],
};
