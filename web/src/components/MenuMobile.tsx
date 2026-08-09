"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconeMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconeFechar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Navegação do celular.
 *
 * Substitui a tira com rolagem horizontal: com oito destinos, só quatro
 * apareciam, e os outros dependiam de a pessoa descobrir que aquilo arrastava.
 * A gaveta mostra os oito de uma vez e devolve a faixa vertical que a tira
 * ocupava em todas as páginas.
 */
export function MenuMobile({
  itens,
}: {
  itens: { href: string; label: string }[];
}) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  // Navegar fecha a gaveta. O clique no link não desmonta este componente,
  // então sem isto o painel continuaria aberto sobre a página nova.
  useEffect(() => setAberto(false), [caminho]);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);

    // Trava a rolagem do fundo: sem isso, arrastar sobre a gaveta rola a
    // página atrás dela.
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setAberto(true)}
        aria-expanded={aberto}
        aria-label="Abrir menu"
        className="focavel rounded-lg p-2 text-ink transition hover:bg-bordo/5 dark:text-cream dark:hover:bg-white/10"
      >
        <IconeMenu className="h-6 w-6" />
      </button>

      {aberto && (
        <>
          <button
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default bg-ink/30 backdrop-blur-[2px] dark:bg-black/50"
          />

          <nav
            aria-label="Navegação principal"
            className="fixed right-0 top-0 z-50 flex h-full w-[min(18rem,85vw)] flex-col border-l border-line bg-cream p-4 dark:border-white/10 dark:bg-bordo-deep"
          >
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="focavel rounded-lg p-2 text-muted transition hover:bg-bordo/5 dark:hover:bg-white/10"
              >
                <IconeFechar className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto">
              {itens.map((n) => {
                const ativo = caminho === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={ativo ? "page" : undefined}
                    // min-h-[44px]: alvo de toque minimo acessivel.
                    className={`focavel flex min-h-[44px] items-center rounded-xl px-3 text-[15px] font-medium transition ${
                      ativo
                        ? "bg-bordo/10 text-ink dark:bg-white/10 dark:text-cream"
                        : "text-muted hover:bg-bordo/5 hover:text-ink dark:hover:bg-white/10 dark:hover:text-cream"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
