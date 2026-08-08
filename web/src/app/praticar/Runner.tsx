"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { embaralhar, type Question } from "@/lib/tipos";
import { registrar } from "@/lib/progresso";

interface Props {
  questoes: Question[];
  titulo: string;
  /** Semente vinda do servidor: mantem servidor e cliente na mesma ordem. */
  seed: number;
  /** Quantas questoes do acervo entram nesta sessao. */
  tamanho: number;
}

export function Runner({ questoes, titulo, seed, tamanho }: Props) {
  const ordem = useMemo(
    () => embaralhar(questoes, seed).slice(0, tamanho),
    [questoes, seed, tamanho],
  );
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [respondida, setRespondida] = useState(false);

  const questao = ordem[i];
  const fim = i >= ordem.length;
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

  if (!ordem.length) {
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
    const pct = Math.round((acertos / ordem.length) * 100);
    return (
      <div className="card text-center">
        <p className="eyebrow">Sessão concluída</p>
        <p className="mt-3 tnum font-serif text-5xl font-semibold">{pct}%</p>
        <p className="mt-2 text-muted">
          {acertos} de {ordem.length} corretas
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
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-2xl font-semibold">{titulo}</h1>
          <span className="text-sm text-muted">
            {acertos}/{respondidas} corretas
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${(respondidas / ordem.length) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        key={questao.id}
        questao={questao}
        posicao={`${i + 1} de ${ordem.length}`}
        onResponder={responder}
        linkPermanente
      />

      {respondida && (
        <button onClick={proxima} className="btn-primary w-full">
          {i + 1 === ordem.length ? "Ver resultado" : "Próxima questão"}
        </button>
      )}
    </div>
  );
}
