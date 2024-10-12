/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        darkBackground: "#000000",
        darkText: "#d6d6d6",
        darkPostCardBackground: "#0c0f0a",
        darkPostCardBg2: "#cc8b86",
        darkBlue: "#3a86ff",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
