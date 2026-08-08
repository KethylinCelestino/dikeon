"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const proximo = !dark;
    setDark(proximo);
    document.documentElement.classList.toggle("dark", proximo);
    localStorage.setItem("theme", proximo ? "dark" : "light");
  }

  return (
    <button
      onClick={alternar}
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-ink dark:border-white/15 dark:hover:text-cream"
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
