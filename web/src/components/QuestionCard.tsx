"use client";

import Link from "next/link";
import { useState } from "react";
import type { Explicacao, Question } from "@/lib/tipos";
import { nomeMateria, rotuloExame } from "@/lib/tipos";

const LETRAS = ["A", "B", "C", "D"] as const;

function IconeCerto({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconeErrado({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

interface Props {
  questao: Question;
  /** Numeracao dentro da sessao, ex. "12 de 20". */
  posicao?: string;
  /** No simulado a resposta certa so aparece no fim. */
  revelarNaHora?: boolean;
  onResponder?: (escolhida: string, acertou: boolean) => void;
  escolhidaInicial?: string | null;
  linkPermanente?: boolean;
  /** Comentário da questão, exibido depois de responder. */
  explicacao?: Explicacao | null;
}

export function QuestionCard({
  questao,
  posicao,
  revelarNaHora = true,
  onResponder,
  escolhidaInicial = null,
  linkPermanente = false,
  explicacao = null,
}: Props) {
  const [escolhida, setEscolhida] = useState<string | null>(escolhidaInicial);
  const respondida = escolhida !== null;
  const revelar = respondida && revelarNaHora;
  const acertou = escolhida === questao.correta;

  function escolher(letra: string) {
    if (respondida) return;
    setEscolhida(letra);
    onResponder?.(letra, letra === questao.correta);
  }

  return (
    <article className="card">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="eyebrow">
          {posicao ? `${posicao} · ` : ""}
          {rotuloExame(questao.exame)} · questão {questao.numero}
        </span>
        <span className="rounded-full bg-info-tint px-2.5 py-0.5 text-[13px] font-medium text-info dark:bg-white/10 dark:text-cream">
          {nomeMateria(questao.materia)}
        </span>
        {questao.desatualizada && (
          <span className="rounded-full bg-warning-tint px-2.5 py-0.5 text-[13px] font-medium text-warning dark:bg-warning/20 dark:text-cream">
            desatualizada
          </span>
        )}
      </div>

      <p className="max-w-leitura whitespace-pre-line text-questao">
        {questao.enunciado}
      </p>

      <ul className="mt-5 max-w-leitura space-y-2">
        {LETRAS.map((letra) => {
          const texto = questao.alternativas[letra];
          if (!texto) return null;

          const isCorreta = letra === questao.correta;
          const isEscolhida = letra === escolhida;

          // Feedback nunca é só cor: sempre cor + ícone + texto (seção 7).
          let estilo =
            "border-line hover:border-bordo/40 dark:border-white/15 dark:hover:border-cream/30";
          if (revelar && isCorreta) {
            estilo =
              "border-success bg-success-tint dark:bg-success/15 dark:border-success-dark";
          } else if (revelar && isEscolhida) {
            estilo =
              "border-error bg-error-tint dark:bg-error/15 dark:border-error-dark";
          } else if (!revelarNaHora && isEscolhida) {
            estilo = "border-bordo bg-info-tint dark:border-cream dark:bg-white/10";
          }

          return (
            <li key={letra}>
              <button
                onClick={() => escolher(letra)}
                disabled={respondida && revelarNaHora}
                aria-pressed={isEscolhida}
                // min-h-[44px]: alvo de toque mínimo acessível.
                className={`focavel flex min-h-[44px] w-full items-start gap-3 rounded-xl border p-3.5 text-left text-questao transition ${estilo}`}
              >
                <span className="font-semibold tabular-nums">{letra}</span>
                <span className="flex-1">{texto}</span>
                {revelar && isCorreta && (
                  <IconeCerto className="mt-0.5 h-5 w-5 shrink-0 text-success dark:text-success-dark" />
                )}
                {revelar && isEscolhida && !isCorreta && (
                  <IconeErrado className="mt-0.5 h-5 w-5 shrink-0 text-error dark:text-error-dark" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {revelar && (
        <div className="mt-4 max-w-leitura space-y-2 text-[15px]">
          <p
            className={`flex items-center gap-2 font-semibold ${
              acertou
                ? "text-success-text dark:text-success-dark"
                : "text-error dark:text-error-dark"
            }`}
          >
            {acertou ? (
              <IconeCerto className="h-4 w-4" />
            ) : (
              <IconeErrado className="h-4 w-4" />
            )}
            {acertou ? "Você acertou." : `Resposta correta: ${questao.correta}.`}
          </p>
          {questao.desatualizada && questao.motivo_desatualizacao && (
            <p className="rounded-xl bg-warning-tint px-3 py-2 text-warning dark:bg-warning/15 dark:text-cream">
              Atenção: {questao.motivo_desatualizacao}
            </p>
          )}

          {explicacao && (
            <div className="rounded-xl bg-info-tint p-4 dark:bg-white/5">
              <p className="eyebrow mb-2">Comentário</p>
              <p className="leading-relaxed">{explicacao.correta}</p>

              {/* Só o erro que a pessoa cometeu: comentar as outras três
                  transformaria a revisão em leitura longa. */}
              {!acertou && escolhida && explicacao.erradas[escolhida] && (
                <p className="mt-3 leading-relaxed">
                  <span className="font-semibold">
                    Por que a {escolhida} não serve:{" "}
                  </span>
                  {explicacao.erradas[escolhida]}
                </p>
              )}

              {explicacao.fundamento && (
                <p className="mt-3 text-[13px]">
                  <span className="text-muted">Fundamento: </span>
                  <span className="font-medium text-gold-text decoration-dotted underline-offset-4 dark:text-gold">
                    {explicacao.fundamento}
                  </span>
                </p>
              )}

              <p className="mt-3 text-[13px] text-muted">
                Comentário gerado por IA a partir do gabarito oficial. Confira o
                dispositivo antes de usar como fonte.
              </p>
            </div>
          )}
        </div>
      )}

      {linkPermanente && (
        <Link
          href={`/questao/${questao.id}`}
          className="focavel mt-4 inline-block rounded text-[13px] font-medium text-bordo underline-offset-4 hover:underline dark:text-cream"
        >
          Ver questão isolada
        </Link>
      )}
    </article>
  );
}
