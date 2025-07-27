/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Unbounded"', 'cursive'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        darkBackground: "#231f20",
        darkPostCardBg: "#231f20",
        darkPostCardBackground: "#252323",
        darkText: "#d6d6d6",
        darkPostCardBg2: "#cc8b86",
        darkBlue: "#3a86ff",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
