"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { calcularPainel, META_DIARIA, type Painel } from "@/lib/gamificacao";

/**
 * Bloco "sua sessão de hoje" no topo da home.
 *
 * Só aparece para quem já estudou: para quem chega pela primeira vez, a home
 * segue sendo a página de apresentação, que é o que o Google indexa.
 */
export function SessaoHoje() {
  const [painel, setPainel] = useState<Painel | null>(null);

  useEffect(() => setPainel(calcularPainel()), []);

  if (!painel || painel.totalQuestoes === 0) return null;

  const pct = Math.min(100, Math.round((painel.hoje / META_DIARIA) * 100));
  const faltam = Math.max(0, META_DIARIA - painel.hoje);

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Sua sessão de hoje</p>
          <p className="mt-2 font-serif text-2xl font-semibold">
            {painel.metaBatida
              ? "Meta batida. Continue se quiser."
              : `Faltam ${faltam} ${faltam === 1 ? "questão" : "questões"} para a meta de hoje.`}
          </p>
        </div>
        <div className="flex gap-5 text-center">
          <div>
            <p className="tnum font-serif text-2xl font-semibold text-gold">
              {painel.streak}
            </p>
            <p className="text-[13px] text-muted">
              {painel.streak === 1 ? "dia seguido" : "dias seguidos"}
            </p>
          </div>
          <div>
            <p className="tnum font-serif text-2xl font-semibold">
              {painel.nivel.nivel}
            </p>
            <p className="text-[13px] text-muted">nível</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 tnum text-[13px] text-muted">
        {painel.hoje} de {META_DIARIA} questões hoje
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/praticar" className="btn-primary">
          {painel.hoje > 0 ? "Continuar" : "Começar"}
        </Link>
        <Link href="/revisar" className="btn-ghost">
          Revisar erros
        </Link>
        <Link href="/flashcards" className="btn-ghost">
          Flashcards
        </Link>
      </div>
    </section>
  );
}
