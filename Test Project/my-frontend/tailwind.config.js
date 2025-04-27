/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // if you use any classes in your HTML template
    "./src/**/*.{js,ts,jsx,tsx}", // scan all of src for Tailwind classes
  ],
  darkMode: "media", // or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
