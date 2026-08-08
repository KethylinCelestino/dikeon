"use client";

import { useEffect, useRef, useState } from "react";
import { desempenho, type Desempenho } from "@/lib/progresso";

interface Mensagem {
  papel: "user" | "assistant";
  texto: string;
}

const SUGESTOES = [
  "Analise meus erros e diga por onde começar",
  "Tenho 30 minutos hoje. O que estudo?",
  "Explique controle de constitucionalidade difuso e concentrado",
  "Monte um plano para as próximas duas semanas",
];

export function Chat() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [entrada, setEntrada] = useState("");
  const [pensando, setPensando] = useState(false);
  const [dados, setDados] = useState<Desempenho | null>(null);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void desempenho().then(setDados);
  }, []);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, pensando]);

  async function enviar(texto: string) {
    const limpo = texto.trim();
    if (!limpo || pensando) return;

    const novas: Mensagem[] = [...mensagens, { papel: "user", texto: limpo }];
    setMensagens(novas);
    setEntrada("");
    setPensando(true);

    try {
      const r = await fetch("/api/zel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novas, desempenho: dados }),
      });
      const d = await r.json();
      setMensagens([
        ...novas,
        {
          papel: "assistant",
          texto: d.texto ?? d.erro ?? "Não consegui responder agora.",
        },
      ]);
    } catch {
      setMensagens([
        ...novas,
        { papel: "assistant", texto: "Falhou a conexão. Tente de novo." },
      ]);
    } finally {
      setPensando(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Zel</h1>
        <p className="mt-2 max-w-leitura text-muted">
          Sua monitora de estudos. Ela enxerga seu desempenho por matéria, então
          pode falar do seu caso, não de generalidades.
        </p>
      </div>

      {mensagens.length === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => void enviar(s)}
              className="focavel rounded-xl border border-line p-3 text-left text-sm transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {mensagens.map((m, i) => (
          <div
            key={i}
            className={
              m.papel === "user"
                ? "ml-auto max-w-[85%] rounded-2xl bg-bordo px-4 py-3 text-[15px] text-cream dark:bg-white/10"
                : "max-w-leitura rounded-2xl bg-info-tint px-4 py-3 text-[15px] leading-relaxed dark:bg-white/5"
            }
          >
            {m.papel === "assistant" && <p className="eyebrow mb-1.5">Zel</p>}
            <p className="whitespace-pre-line">{m.texto}</p>
          </div>
        ))}
        {pensando && (
          <p className="max-w-leitura rounded-2xl bg-info-tint px-4 py-3 text-[15px] text-muted dark:bg-white/5">
            Zel está pensando…
          </p>
        )}
        <div ref={fim} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(entrada);
        }}
        className="sticky bottom-4 flex gap-2"
      >
        <input
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          placeholder="Pergunte alguma coisa…"
          aria-label="Sua mensagem para a Zel"
          className="focavel flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none dark:border-white/15 dark:bg-bordo-deep"
        />
        <button
          type="submit"
          disabled={pensando || !entrada.trim()}
          className="btn-primary"
        >
          Enviar
        </button>
      </form>

      <p className="text-[13px] text-muted">
        A Zel é uma IA e pode errar, inclusive em citações legais. Confira o
        dispositivo no Vade Mecum antes de usar como fonte.
      </p>
    </div>
  );
}
