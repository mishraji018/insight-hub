/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {

          dark: "#0a0a0f",
          light: "#f8f9fa",
        },
        surface: {
          dark: "#13131a",
          light: "#ffffff",
        },
        primary: "#6c63ff",
        accent: "#6c63ff",
        text: {
          dark: "#f0f0f8",
          light: "#1a1a2e",
        },
        muted: "#6b6b80",
        success: "#00d68f",
        danger: "#ff4d6d",
        warning: "#ffb830",
      }
    },
  },
  plugins: [],
}
