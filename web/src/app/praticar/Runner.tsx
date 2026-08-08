"use client";

import { useState } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import type { Explicacao, Question } from "@/lib/tipos";
import { registrar } from "@/lib/progresso";

interface Props {
  /** Já sorteadas e cortadas no servidor: o cliente recebe só a sessão. */
  questoes: Question[];
  explicacoes: Record<string, Explicacao>;
  titulo: string;
}

export function Runner({ questoes, explicacoes, titulo }: Props) {
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [respondida, setRespondida] = useState(false);

  const questao = questoes[i];
  const fim = i >= questoes.length;
  // A questao atual so entra na contagem depois de respondida.
  const respondidas = respondida ? i + 1 : i;

  function responder(escolhida: string, acertou: boolean) {
    setRespondida(true);
    if (acertou) setAcertos((n) => n + 1);
    registrar({
      questaoId: questao.id,
      materia: questao.materia,
      escolhida,
      acertou,
    });
  }

  function proxima() {
    setRespondida(false);
    setI((n) => n + 1);
  }

  if (!questoes.length) {
    return (
      <div className="card">
        <p>Nenhuma questão disponível com esse filtro.</p>
        <Link href="/praticar" className="btn-ghost mt-4">
          Voltar
        </Link>
      </div>
    );
  }

  if (fim) {
    const pct = Math.round((acertos / questoes.length) * 100);
    return (
      <div className="card text-center">
        <p className="eyebrow">Sessão concluída</p>
        <p className="mt-3 tnum font-serif text-5xl font-semibold">{pct}%</p>
        <p className="mt-2 text-muted">
          {acertos} de {questoes.length} corretas
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/praticar" className="btn-primary">
            Nova sessão
          </Link>
          <Link href="/progresso" className="btn-ghost">
            Ver progresso
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-serif text-2xl font-semibold">{titulo}</h1>
          <span className="tnum shrink-0 text-sm text-muted">
            {acertos}/{respondidas} corretas
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${(respondidas / questoes.length) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        key={questao.id}
        questao={questao}
        posicao={`${i + 1} de ${questoes.length}`}
        explicacao={explicacoes[questao.id] ?? null}
        onResponder={responder}
        linkPermanente
      />

      {respondida && (
        <button onClick={proxima} className="btn-primary w-full">
          {i + 1 === questoes.length ? "Ver resultado" : "Próxima questão"}
        </button>
      )}
    </div>
  );
}
