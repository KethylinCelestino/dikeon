"use client";

import { useState } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { nomeMateria, type Explicacao, type Question } from "@/lib/tipos";
import { registrar } from "@/lib/progresso";

interface Props {
  questoes: Question[];
  explicacoes: Record<string, Explicacao>;
}

export function Runner({ questoes, explicacoes }: Props) {
  const [iniciado, setIniciado] = useState(false);
  const [i, setI] = useState(0);
  const [respondida, setRespondida] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [acertos, setAcertos] = useState(0);

  if (!iniciado) {
    return (
      <div className="card max-w-leitura">
        <p className="eyebrow">Diagnóstico</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">
          Descubra por onde começar
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Uma questão de cada uma das {questoes.length} matérias da 1ª fase.
          Leva uns 15 minutos e termina com a lista das matérias em que você
          está mais fraco — que é por onde vale começar a estudar.
        </p>
        <p className="mt-3 text-sm text-muted">
          Uma questão por matéria não mede seu nível com precisão. Serve para
          ordenar prioridades, não para dar nota.
        </p>
        <button onClick={() => setIniciado(true)} className="btn-primary mt-6">
          Começar diagnóstico
        </button>
      </div>
    );
  }

  const fim = i >= questoes.length;

  if (fim) {
    const fortes = questoes
      .map((q) => q.materia)
      .filter((m): m is string => !!m && !erros.includes(m));

    return (
      <div className="space-y-6">
        <div className="card text-center">
          <p className="eyebrow">Resultado do diagnóstico</p>
          <p className="mt-3 tnum font-serif text-5xl font-semibold">
            {acertos}/{questoes.length}
          </p>
          <p className="mt-2 text-muted">matérias acertadas</p>
        </div>

        {erros.length > 0 && (
          <div className="card">
            <h2 className="font-serif text-xl font-semibold">
              Comece por estas
            </h2>
            <p className="mt-1 text-sm text-muted">
              Você errou a questão destas matérias. Elas entram primeiro no seu
              plano.
            </p>
            <div className="mt-4 space-y-2">
              {erros.map((mid) => (
                <Link
                  key={mid}
                  href={`/praticar?materia=${mid}`}
                  className="focavel flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
                >
                  <span>{nomeMateria(mid)}</span>
                  <span className="text-muted">praticar →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {fortes.length > 0 && (
          <div className="card">
            <h2 className="font-serif text-xl font-semibold">
              Você foi bem em
            </h2>
            <p className="mt-2 text-sm text-muted">
              {fortes.map((m) => nomeMateria(m)).join(" · ")}
            </p>
          </div>
        )}

        <Link href="/progresso" className="btn-ghost w-full">
          Ver progresso completo
        </Link>
      </div>
    );
  }

  const questao = questoes[i];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-serif text-2xl font-semibold">Diagnóstico</h1>
          <span className="tnum shrink-0 text-sm text-muted">
            {i + (respondida ? 1 : 0)}/{questoes.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{
              width: `${((i + (respondida ? 1 : 0)) / questoes.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <QuestionCard
        key={questao.id}
        questao={questao}
        posicao={`${i + 1} de ${questoes.length}`}
        explicacao={explicacoes[questao.id] ?? null}
        onResponder={(escolhida, acertou) => {
          setRespondida(true);
          if (acertou) setAcertos((n) => n + 1);
          else if (questao.materia) {
            setErros((e) => [...e, questao.materia!]);
          }
          registrar({
            questaoId: questao.id,
            materia: questao.materia,
            escolhida,
            acertou,
          });
        }}
      />

      {respondida && (
        <button
          onClick={() => {
            setRespondida(false);
            setI((n) => n + 1);
          }}
          className="btn-primary w-full"
        >
          {i + 1 === questoes.length ? "Ver resultado" : "Próxima matéria"}
        </button>
      )}
    </div>
  );
}
