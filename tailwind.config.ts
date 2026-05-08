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
        ink: "#111827",
        line: "#d7dde8",
        brand: "#0f766e",
        signal: "#b45309"
      },
      boxShadow: {
        panel: "0 1px 2px rgb(15 23 42 / 0.08)"
      }
    }
  },
  plugins: [typography]
};

export default config;
