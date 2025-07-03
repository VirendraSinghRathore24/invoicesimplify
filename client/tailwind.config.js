/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // <== important for dark mode
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        base: "16px", // ensure default font size is 16px
      },
    },
  },
  plugins: [],
};
