"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { materias, nomeMateria } from "@/lib/tipos";
import { desempenho, limpar, type Desempenho } from "@/lib/progresso";

/** `totalPorMateria` vem do servidor para nao carregar o banco no cliente. */
export function Painel({
  totalPorMateria,
}: {
  totalPorMateria: Record<string, number>;
}) {
  // O progresso vive no localStorage, entao so existe apos a montagem.
  const [dados, setDados] = useState<Desempenho | null>(null);

  useEffect(() => {
    void desempenho().then(setDados);
  }, []);

  if (!dados) return <p className="text-muted">Carregando…</p>;

  if (dados.total === 0) {
    return (
      <div className="card text-center">
        <h1 className="font-serif text-2xl font-semibold">Nenhuma questão ainda</h1>
        <p className="mt-2 text-muted">
          Responda algumas questões e seu desempenho por matéria aparece aqui.
        </p>
        <Link href="/praticar" className="btn-primary mt-6">
          Começar a praticar
        </Link>
      </div>
    );
  }

  const pct = Math.round((dados.acertos / dados.total) * 100);

  const linhas = materias
    .map((m) => ({ materia: m, s: dados.porMateria[m.id] }))
    .filter((l) => l.s)
    .sort((a, b) => a.s!.acertos / a.s!.total - b.s!.acertos / b.s!.total);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Seu progresso</h1>
        <p className="mt-2 text-muted">
          {dados.daConta
            ? "Salvo na sua conta e disponível em qualquer dispositivo."
            : "Salvo neste navegador. Com conta, ele acompanha você em qualquer dispositivo."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { n: `${pct}%`, l: "taxa de acertos" },
          { n: String(dados.total), l: "questões respondidas" },
          { n: String(dados.distintas), l: "questões distintas" },
        ].map((s) => (
          <div key={s.l} className="card">
            <p className="font-serif text-3xl font-semibold">{s.n}</p>
            <p className="mt-1 text-sm text-muted">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-serif text-lg font-semibold">Por matéria</h2>
        <p className="mt-1 text-sm text-muted">
          Da mais fraca para a mais forte. Comece por cima.
        </p>
        <div className="mt-5 space-y-3">
          {linhas.map(({ materia, s }) => {
            const taxa = Math.round((s!.acertos / s!.total) * 100);
            return (
              <Link
                key={materia.id}
                href={`/praticar?materia=${materia.id}`}
                className="flex items-center gap-3 text-sm"
              >
                <span className="flex-1">{nomeMateria(materia.id)}</span>
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      taxa >= 70 ? "bg-success" : taxa >= 50 ? "bg-warning" : "bg-error"
                    }`}
                    style={{ width: `${taxa}%` }}
                  />
                </div>
                <span className="w-20 text-right text-muted">
                  {taxa}% · {s!.total}/{totalPorMateria[materia.id] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          limpar();
          void desempenho().then(setDados);
        }}
        className="text-sm text-muted hover:underline"
      >
        Apagar meu progresso
      </button>
    </div>
  );
}
