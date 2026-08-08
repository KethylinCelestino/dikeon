"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import type { Explicacao, Question } from "@/lib/tipos";
import { paraRevisar, registrar } from "@/lib/progresso";

const TAMANHO_SESSAO = 20;

type Estado =
  | { fase: "carregando" }
  | { fase: "vazio" }
  | { fase: "erro" }
  | {
      fase: "pronto";
      questoes: Question[];
      explicacoes: Record<string, Explicacao>;
      pendentes: number;
    };

export function Revisao() {
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [respondida, setRespondida] = useState(false);

  useEffect(() => {
    void paraRevisar().then((ids) => {
      if (!ids.length) {
        setEstado({ fase: "vazio" });
        return;
      }
      // O histórico é do usuário; o banco de questões vive no servidor.
      return fetch("/api/questoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ids.slice(0, TAMANHO_SESSAO) }),
    })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d) =>
          setEstado({
            fase: "pronto",
            questoes: d.questoes,
            explicacoes: d.explicacoes,
            pendentes: ids.length,
          }),
        );
    }).catch(() => setEstado({ fase: "erro" }));
  }, []);

  if (estado.fase === "carregando") {
    return <p className="text-muted">Carregando suas questões…</p>;
  }

  if (estado.fase === "erro") {
    return (
      <div className="card">
        <h1 className="font-serif text-2xl font-semibold">
          Não deu para carregar
        </h1>
        <p className="mt-2 text-muted">Tente de novo em instantes.</p>
        <Link href="/praticar" className="btn-ghost mt-6">
          Voltar
        </Link>
      </div>
    );
  }

  if (estado.fase === "vazio") {
    return (
      <div className="card text-center">
        <h1 className="font-serif text-2xl font-semibold">Nada para revisar</h1>
        <p className="mt-2 text-muted">
          Você ainda não errou nenhuma questão. Assim que errar, ela aparece
          aqui até você acertá-la.
        </p>
        <Link href="/praticar" className="btn-primary mt-6">
          Praticar
        </Link>
      </div>
    );
  }

  const { questoes, explicacoes, pendentes } = estado;
  const questao = questoes[i];
  const fim = i >= questoes.length;
  const respondidas = respondida ? i + 1 : i;

  if (fim) {
    const restantes = pendentes - questoes.length;
    return (
      <div className="card text-center">
        <p className="eyebrow">Revisão concluída</p>
        <p className="mt-3 tnum font-serif text-5xl font-semibold">
          {acertos}/{questoes.length}
        </p>
        <p className="mt-2 text-muted">
          {acertos === questoes.length
            ? "Todas certas desta vez."
            : "As que você errou de novo continuam na fila."}
        </p>
        {restantes > 0 && (
          <p className="mt-1 text-sm text-muted">
            Ainda restam {restantes} questões para revisar.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/revisar" className="btn-primary">
            Continuar revisando
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
          <h1 className="font-serif text-2xl font-semibold">
            Revisar meus erros
          </h1>
          <span className="tnum shrink-0 text-sm text-muted">
            {acertos}/{respondidas} corretas
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {pendentes} {pendentes === 1 ? "questão pendente" : "questões pendentes"}
          . Acertar tira a questão da fila.
        </p>
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
        onResponder={(escolhida, acertou) => {
          setRespondida(true);
          if (acertou) setAcertos((n) => n + 1);
          registrar({
            questaoId: questao.id,
            materia: questao.materia,
            escolhida,
            acertou,
          });
        }}
        linkPermanente
      />

      {respondida && (
        <button
          onClick={() => {
            setRespondida(false);
            setI((n) => n + 1);
          }}
          className="btn-primary w-full"
        >
          {i + 1 === questoes.length ? "Ver resultado" : "Próxima questão"}
        </button>
      )}
    </div>
  );
}
