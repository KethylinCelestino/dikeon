"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { nomeMateria, type Flashcard } from "@/lib/tipos";
import { avaliar, montarSessao, resumo, type Nota, type ResumoSrs } from "@/lib/srs";

const TAMANHO_SESSAO = 20;

interface Props {
  cartoes: Flashcard[];
}

export function Sessao({ cartoes }: Props) {
  const porId = useMemo(
    () => new Map(cartoes.map((c) => [c.id, c])),
    [cartoes],
  );

  // O estado da revisão vive no localStorage, então só existe após a montagem.
  const [fila, setFila] = useState<string[] | null>(null);
  const [numeros, setNumeros] = useState<ResumoSrs | null>(null);
  const [i, setI] = useState(0);
  const [virado, setVirado] = useState(false);
  const [avaliados, setAvaliados] = useState(0);

  useEffect(() => {
    const ids = cartoes.map((c) => c.id);
    setNumeros(resumo(ids));
    setFila(montarSessao(ids, TAMANHO_SESSAO));
  }, [cartoes]);

  if (!fila || !numeros) return <p className="text-muted">Carregando…</p>;

  if (!fila.length) {
    return (
      <div className="card text-center">
        <h1 className="font-serif text-2xl font-semibold">Tudo em dia</h1>
        <p className="mt-2 text-muted">
          Você já revisou todos os {numeros.vistos} cartões e nenhum venceu
          ainda. Volte amanhã.
        </p>
        <Link href="/praticar" className="btn-primary mt-6">
          Praticar questões
        </Link>
      </div>
    );
  }

  if (i >= fila.length) {
    return (
      <div className="card text-center">
        <p className="eyebrow">Sessão concluída</p>
        <p className="mt-3 tnum font-serif text-5xl font-semibold">
          {avaliados}
        </p>
        <p className="mt-2 text-muted">
          {avaliados === 1 ? "cartão revisado" : "cartões revisados"}
        </p>
        <p className="mt-1 text-sm text-muted">
          Os que você errou voltam logo; os fáceis só daqui a alguns dias.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/flashcards" className="btn-primary">
            Nova sessão
          </Link>
          <Link href="/praticar" className="btn-ghost">
            Praticar questões
          </Link>
        </div>
      </div>
    );
  }

  const cartao = porId.get(fila[i]);
  if (!cartao) return null;

  function responder(nota: Nota) {
    avaliar(fila![i], nota);
    setAvaliados((n) => n + 1);
    setVirado(false);
    setI((n) => n + 1);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-serif text-2xl font-semibold">Flashcards</h1>
          <span className="tnum shrink-0 text-sm text-muted">
            {i + 1} de {fila.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${(i / fila.length) * 100}%` }}
          />
        </div>
      </div>

      <article className="card min-h-[280px]">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">{nomeMateria(cartao.materia)}</span>
          <span className="rounded-full bg-info-tint px-2.5 py-0.5 text-[13px] font-medium text-info dark:bg-white/10 dark:text-cream">
            {cartao.tema}
          </span>
        </div>

        <p className="max-w-leitura text-questao font-medium">{cartao.frente}</p>

        {virado ? (
          <div className="mt-5 max-w-leitura border-t border-line pt-5 dark:border-white/10">
            <p className="text-questao">{cartao.verso}</p>
            {cartao.fundamento && (
              <p className="mt-3 text-[13px]">
                <span className="text-muted">Fundamento: </span>
                <span className="font-medium text-gold-text dark:text-gold">
                  {cartao.fundamento}
                </span>
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setVirado(true)}
            className="btn-primary mt-6 w-full"
          >
            Mostrar resposta
          </button>
        )}
      </article>

      {virado && (
        <div>
          <p className="mb-2 text-center text-sm text-muted">
            Você sabia esta?
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => responder("errei")}
              className="focavel rounded-xl border border-error bg-error-tint px-3 py-3 text-sm font-semibold text-error transition dark:border-error-dark dark:bg-error/15 dark:text-error-dark"
            >
              Errei
            </button>
            <button
              onClick={() => responder("dificil")}
              className="focavel rounded-xl border border-warning bg-warning-tint px-3 py-3 text-sm font-semibold text-warning transition dark:bg-warning/15 dark:text-cream"
            >
              Difícil
            </button>
            <button
              onClick={() => responder("facil")}
              className="focavel rounded-xl border border-success bg-success-tint px-3 py-3 text-sm font-semibold text-success-text transition dark:border-success-dark dark:bg-success/15 dark:text-success-dark"
            >
              Fácil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
