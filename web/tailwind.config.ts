import type { Config } from "tailwindcss";

// Tokens do brand/BRAND-GUIDE.md v2.0. Bordô é a cor da marca; ouro é
// monopólio de conquista (XP, streak, nível) e nunca decora navegação.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bordo: { DEFAULT: "#4a1420", hover: "#63202e", deep: "#2a0d13" },
        gold: { DEFAULT: "#e2b84a", text: "#7e611c" },
        cream: "#faf6ed",
        ink: "#2b191e",
        muted: "#8b7378",
        line: "#ebe2de",
        // Semânticas: acerto e erro são a interação central do produto e
        // precisam de identidade fixa em todas as telas.
        success: { DEFAULT: "#1c8c70", text: "#157059", tint: "#eaf8f3", dark: "#4ecba5" },
        error: { DEFAULT: "#b02a37", tint: "#fdecee", dark: "#f09aa3" },
        warning: { DEFAULT: "#8a5a0f", tint: "#fff7df" },
        info: { DEFAULT: "#63202e", tint: "#f8eeec" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "ui-serif", "serif"],
      },
      fontSize: {
        // Corpo de questão: 17/28 conforme a regra de leitura longa do guia.
        questao: ["17px", { lineHeight: "1.65" }],
      },
      maxWidth: {
        // 50-75 caracteres por linha; 68ch fica no meio da faixa ideal.
        leitura: "68ch",
      },
      boxShadow: {
        card: "0 18px 50px rgba(74,20,32,.10)",
      },
    },
  },
  plugins: [],
};

export default config;
