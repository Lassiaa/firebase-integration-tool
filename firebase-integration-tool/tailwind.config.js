/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",
        secondary: "#000000",
        tertiary: "#0000ff",
      },
      width: {
        big: "420px",
      },
      maxWidth: {
        big: "420px",
      },
    },
  },
  plugins: [],
};
