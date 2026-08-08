"use client";

import Link from "next/link";
import { useState } from "react";
import type { Question } from "@/lib/tipos";
import { nomeMateria, rotuloExame } from "@/lib/tipos";

const LETRAS = ["A", "B", "C", "D"] as const;

interface Props {
  questao: Question;
  /** Numeracao dentro da sessao, ex. "12 de 20". */
  posicao?: string;
  /** No simulado a resposta certa so aparece no fim. */
  revelarNaHora?: boolean;
  onResponder?: (escolhida: string, acertou: boolean) => void;
  escolhidaInicial?: string | null;
  linkPermanente?: boolean;
}

export function QuestionCard({
  questao,
  posicao,
  revelarNaHora = true,
  onResponder,
  escolhidaInicial = null,
  linkPermanente = false,
}: Props) {
  const [escolhida, setEscolhida] = useState<string | null>(escolhidaInicial);
  const respondida = escolhida !== null;
  const revelar = respondida && revelarNaHora;

  function escolher(letra: string) {
    if (respondida) return;
    setEscolhida(letra);
    onResponder?.(letra, letra === questao.correta);
  }

  return (
    <article className="card">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="eyebrow">
          {posicao ? `${posicao} · ` : ""}
          {rotuloExame(questao.exame)} · questão {questao.numero}
        </span>
        <span className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-medium text-royal dark:bg-white/10 dark:text-gold">
          {nomeMateria(questao.materia)}
        </span>
        {questao.desatualizada && (
          <span className="rounded-full bg-wine/10 px-2.5 py-0.5 text-xs font-medium text-wine dark:bg-wine/25 dark:text-cream">
            desatualizada
          </span>
        )}
      </div>

      <p className="whitespace-pre-line text-[15px] leading-relaxed">
        {questao.enunciado}
      </p>

      <ul className="mt-4 space-y-2">
        {LETRAS.map((letra) => {
          const texto = questao.alternativas[letra];
          if (!texto) return null;

          const isCorreta = letra === questao.correta;
          const isEscolhida = letra === escolhida;

          let estilo =
            "border-line hover:border-navy/40 dark:border-white/15 dark:hover:border-gold/50";
          if (revelar && isCorreta) {
            estilo = "border-green bg-green/10 dark:bg-green/20";
          } else if (revelar && isEscolhida) {
            estilo = "border-wine bg-wine/10 dark:bg-wine/20";
          } else if (!revelarNaHora && isEscolhida) {
            estilo = "border-navy bg-navy/5 dark:border-gold dark:bg-white/10";
          }

          return (
            <li key={letra}>
              <button
                onClick={() => escolher(letra)}
                disabled={respondida && revelarNaHora}
                className={`flex w-full gap-3 rounded-xl border p-3 text-left text-sm transition ${estilo}`}
              >
                <span className="font-semibold">{letra}</span>
                <span className="flex-1">{texto}</span>
                {revelar && isCorreta && (
                  <span className="font-semibold text-green">✓</span>
                )}
                {revelar && isEscolhida && !isCorreta && (
                  <span className="font-semibold text-wine">✕</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {revelar && (
        <p className="mt-4 text-sm text-muted">
          {escolhida === questao.correta
            ? "Correta."
            : `Resposta correta: ${questao.correta}.`}
          {questao.desatualizada && questao.motivo_desatualizacao && (
            <> Atenção: {questao.motivo_desatualizacao}</>
          )}
        </p>
      )}

      {linkPermanente && (
        <Link
          href={`/questao/${questao.id}`}
          className="mt-3 inline-block text-sm font-medium text-royal underline-offset-4 hover:underline dark:text-gold"
        >
          Ver questão isolada
        </Link>
      )}
    </article>
  );
}
