"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { nomeMateria, type Question } from "@/lib/tipos";
import { registrar } from "@/lib/progresso";

const DURACAO = 5 * 60 * 60; // 5 horas, igual a prova real
const CORTE = 40; // acertos minimos para aprovacao

function relogio(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  return [h, m, seg].map((n) => String(n).padStart(2, "0")).join(":");
}

export function Runner({ questoes }: { questoes: Question[] }) {
  const [iniciado, setIniciado] = useState(false);
  const [i, setI] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [entregue, setEntregue] = useState(false);
  const [restante, setRestante] = useState(DURACAO);

  useEffect(() => {
    if (!iniciado || entregue) return;
    const t = setInterval(() => {
      setRestante((s) => {
        if (s <= 1) {
          setEntregue(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [iniciado, entregue]);

  function entregar() {
    setEntregue(true);
    for (const q of questoes) {
      const escolhida = respostas[q.id];
      if (!escolhida) continue;
      registrar({
        questaoId: q.id,
        materia: q.materia,
        escolhida,
        acertou: escolhida === q.correta,
      });
    }
  }

  if (!iniciado) {
    return (
      <div className="card">
        <p className="eyebrow">Simulado</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">
          80 questões, 5 horas
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Mesmo formato da prova real: distribuição por matéria conforme o
          edital e aprovação com {CORTE} acertos. O gabarito só aparece no
          final.
        </p>
        <button onClick={() => setIniciado(true)} className="btn-primary mt-6">
          Iniciar simulado
        </button>
      </div>
    );
  }

  if (entregue) {
    const acertos = questoes.filter(
      (q) => respostas[q.id] === q.correta,
    ).length;
    const aprovado = acertos >= CORTE;

    const porMateria = new Map<string, { total: number; acertos: number }>();
    for (const q of questoes) {
      const k = q.materia ?? "outros";
      const atual = porMateria.get(k) ?? { total: 0, acertos: 0 };
      atual.total++;
      if (respostas[q.id] === q.correta) atual.acertos++;
      porMateria.set(k, atual);
    }

    return (
      <div className="space-y-6">
        <div className="card text-center">
          <p className="eyebrow">Resultado</p>
          <p className="mt-3 tnum font-serif text-6xl font-semibold">{acertos}</p>
          <p className="mt-1 text-muted">de {questoes.length} questões</p>
          <p
            className={`mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
              aprovado
                ? "bg-success-tint text-success-text dark:bg-success/15 dark:text-success-dark"
                : "bg-error-tint text-error dark:bg-error/15 dark:text-error-dark"
            }`}
          >
            {aprovado ? "Aprovado" : `Faltaram ${CORTE - acertos} acertos`}
          </p>
        </div>

        <div className="card">
          <h2 className="font-serif text-lg font-semibold">Por matéria</h2>
          <div className="mt-4 space-y-2">
            {[...porMateria.entries()]
              .sort((a, b) => a[1].acertos / a[1].total - b[1].acertos / b[1].total)
              .map(([mid, s]) => (
                <div key={mid} className="flex items-center gap-3 text-sm">
                  <span className="flex-1">{nomeMateria(mid)}</span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-bordo dark:bg-cream/70"
                      style={{ width: `${(s.acertos / s.total) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-muted">
                    {s.acertos}/{s.total}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-lg font-semibold">Revisão</h2>
          {questoes.map((q, n) => (
            <QuestionCard
              key={q.id}
              questao={q}
              posicao={`${n + 1} de ${questoes.length}`}
              escolhidaInicial={respostas[q.id] ?? null}
              linkPermanente
            />
          ))}
        </div>
      </div>
    );
  }

  const questao = questoes[i];
  const respondidas = Object.keys(respostas).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <span className="tnum flex items-center gap-1.5 text-sm text-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {relogio(restante)}
        </span>
        <span className="text-sm text-muted">
          {respondidas}/{questoes.length} respondidas
        </span>
      </div>

      <QuestionCard
        key={questao.id}
        questao={questao}
        posicao={`${i + 1} de ${questoes.length}`}
        revelarNaHora={false}
        escolhidaInicial={respostas[questao.id] ?? null}
        onResponder={(escolhida) =>
          setRespostas((r) => ({ ...r, [questao.id]: escolhida }))
        }
      />

      <div className="flex gap-3">
        <button
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          className="btn-ghost flex-1"
        >
          Anterior
        </button>
        {i + 1 < questoes.length ? (
          <button onClick={() => setI((n) => n + 1)} className="btn-primary flex-1">
            Próxima
          </button>
        ) : (
          <button onClick={entregar} className="btn-primary flex-1">
            Entregar prova
          </button>
        )}
      </div>

      <details className="card">
        <summary className="cursor-pointer text-sm font-medium">
          Grade de questões
        </summary>
        <div className="mt-4 grid grid-cols-10 gap-1.5">
          {questoes.map((q, n) => (
            <button
              key={q.id}
              onClick={() => setI(n)}
              className={`aspect-square rounded-md text-xs font-medium transition ${
                respostas[q.id]
                  ? "bg-bordo text-cream dark:bg-cream dark:text-bordo"
                  : "bg-bordo/10 text-muted dark:bg-white/10"
              } ${n === i ? "ring-2 ring-gold" : ""}`}
            >
              {n + 1}
            </button>
          ))}
        </div>
      </details>

      <button onClick={entregar} className="w-full text-sm text-muted hover:underline">
        Entregar antes do tempo
      </button>

      <Link href="/" className="block text-center text-sm text-muted hover:underline">
        Sair do simulado
      </Link>
    </div>
  );
}
