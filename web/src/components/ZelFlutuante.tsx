"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUGESTOES, useZel } from "@/lib/useZel";

function IconeConversa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
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
 * Balão da Zel no canto inferior direito.
 *
 * Existe para a pergunta que nasce no meio do estudo — sobre a questão que
 * está na tela — sem tirar a pessoa da página. A sessão longa continua sendo
 * a /zel, e é para lá que o rodapé do painel aponta.
 */
export function ZelFlutuante() {
  const [aberto, setAberto] = useState(false);
  const [entrada, setEntrada] = useState("");
  const { mensagens, pensando, enviar } = useZel();
  const caminho = usePathname();
  const campo = useRef<HTMLInputElement>(null);
  const fim = useRef<HTMLDivElement>(null);

  // Esc fecha, como em qualquer camada sobreposta.
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  useEffect(() => {
    if (aberto) campo.current?.focus();
  }, [aberto]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, pensando]);

  // Na própria página da Zel o balão seria uma segunda conversa concorrente,
  // na mesma tela, sem memória compartilhada — confuso e sem ganho.
  if (caminho === "/zel") return null;

  return (
    <>
      {aberto && (
        <div
          role="dialog"
          aria-label="Conversa com a Zel"
          className="fixed bottom-20 right-4 z-50 flex max-h-[min(32rem,calc(100vh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col rounded-2xl border border-line bg-white shadow-card dark:border-white/15 dark:bg-bordo-deep"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-white/10">
            <div>
              <p className="font-serif font-semibold">Zel</p>
              <p className="text-[12px] text-muted">Sua monitora de estudos</p>
            </div>
            <button
              onClick={() => setAberto(false)}
              aria-label="Fechar conversa"
              className="focavel rounded-lg p-1.5 text-muted transition hover:bg-bordo/5 dark:hover:bg-white/10"
            >
              <IconeFechar className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {mensagens.length === 0 && (
              <div className="space-y-2">
                <p className="text-[13px] text-muted">
                  Pergunte sobre o que está estudando agora.
                </p>
                {SUGESTOES.slice(0, 2).map((s) => (
                  <button
                    key={s}
                    onClick={() => void enviar(s)}
                    className="focavel block w-full rounded-xl border border-line p-2.5 text-left text-[13px] transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {mensagens.map((m, i) => (
              <div
                key={i}
                className={
                  m.papel === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-bordo px-3 py-2 text-[14px] text-cream dark:bg-white/10"
                    : "rounded-2xl bg-info-tint px-3 py-2 text-[14px] leading-relaxed dark:bg-white/5"
                }
              >
                <p className="whitespace-pre-line">{m.texto}</p>
              </div>
            ))}
            {pensando && (
              <p className="rounded-2xl bg-info-tint px-3 py-2 text-[14px] text-muted dark:bg-white/5">
                Zel está pensando…
              </p>
            )}
            <div ref={fim} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void enviar(entrada);
              setEntrada("");
            }}
            className="flex gap-2 border-t border-line px-3 py-3 dark:border-white/10"
          >
            <input
              ref={campo}
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Pergunte alguma coisa…"
              aria-label="Sua mensagem para a Zel"
              className="focavel min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2 text-[14px] outline-none dark:border-white/15 dark:bg-white/5"
            />
            <button
              type="submit"
              disabled={pensando || !entrada.trim()}
              className="btn-primary px-3 py-2 text-[13px]"
            >
              Enviar
            </button>
          </form>

          <p className="px-4 pb-3 text-[11px] text-muted">
            A Zel pode errar. Confira no{" "}
            <Link href="/vademecum" className="underline underline-offset-2">
              Vade Mecum
            </Link>
            . Para uma conversa longa, use a{" "}
            <Link href="/zel" className="underline underline-offset-2">
              página da Zel
            </Link>
            .
          </p>
        </div>
      )}

      <button
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label={aberto ? "Fechar conversa com a Zel" : "Abrir conversa com a Zel"}
        className="focavel fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-bordo text-cream shadow-card transition hover:bg-bordo-hover dark:bg-gold dark:text-bordo dark:hover:bg-gold/90"
      >
        {aberto ? (
          <IconeFechar className="h-6 w-6" />
        ) : (
          <IconeConversa className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
