import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0b0d",
        line: "#dee1e6",
        brand: "#0052ff",
        signal: "#05b169"
      },
      boxShadow: {
        panel: "0 4px 12px rgb(0 0 0 / 0.04)"
      }
    }
  },
  plugins: [typography]
};

export default config;
