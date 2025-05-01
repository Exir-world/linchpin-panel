const {heroui} = require('@heroui/theme');
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "// Or if using `src` directory:\\r\\n    \\\"./src/**/*.{js,ts,jsx,tsx,mdx}\\\"",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(date-input|toast|form|spinner).js"
  ],
  theme: {
    extend: {
     colors :{
      cancelled:"#6C757D",
      pending:"#FFC107",
      approved:"#28A745",
      rejected:"#DC3545",
      
     }
    },
  },
  darkMode: "class",
  plugins: [nextui(),heroui()],
};
