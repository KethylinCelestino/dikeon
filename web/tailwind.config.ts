import type { Config } from "tailwindcss";

// Paleta herdada do mockup ZEL (content/mock-design).
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0c1f3c",
        royal: "#1f3a5f",
        gold: "#e2b84a",
        cream: "#faf6ed",
        ink: "#17253b",
        muted: "#738096",
        line: "#e5e9ef",
        wine: "#7a1f3d",
        green: "#1c8c70",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Georgia", "ui-serif", "serif"],
      },
      boxShadow: {
        card: "0 18px 50px rgba(12,31,60,.10)",
      },
    },
  },
  plugins: [],
};

export default config;
