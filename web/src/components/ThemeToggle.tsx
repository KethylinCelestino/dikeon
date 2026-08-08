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
      className="focavel grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:border-bordo/30 hover:text-ink dark:border-white/15 dark:hover:border-cream/30 dark:hover:text-cream"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-[18px] w-[18px]"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        )}
      </svg>
    </button>
  );
}
