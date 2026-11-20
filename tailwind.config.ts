import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090B10",
        navy: "#101827",
        teal: "#0F8B8D",
        tealDark: "#0B6B6D",
        mist: "#F5F7FA",
        line: "#E8ECF1",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(9,11,16,.04), 0 8px 24px rgba(9,11,16,.06)",
        lift: "0 12px 40px rgba(9,11,16,.14)",
      },
    },
  },
  plugins: [],
};
export default config;
