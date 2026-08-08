"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  atividadeRecente,
  calcularPainel,
  META_DIARIA,
  type Painel,
} from "@/lib/gamificacao";

/** Próximo Exame de Ordem conhecido. Atualizar quando a FGV publicar o edital. */
const PROXIMA_PROVA = new Date("2026-11-08T00:00:00-03:00");

export function Perfil() {
  const [painel, setPainel] = useState<Painel | null>(null);
  const [atividade, setAtividade] = useState<{ dia: string; n: number }[]>([]);

  useEffect(() => {
    setPainel(calcularPainel());
    setAtividade(atividadeRecente(30));
  }, []);

  if (!painel) return <p className="text-muted">Carregando…</p>;

  if (painel.totalQuestoes === 0) {
    return (
      <div className="card text-center">
        <h1 className="font-serif text-2xl font-semibold">Nada por aqui ainda</h1>
        <p className="mt-2 text-muted">
          Responda algumas questões e seu perfil ganha vida.
        </p>
        <Link href="/praticar" className="btn-primary mt-6">
          Começar
        </Link>
      </div>
    );
  }

  const dias = Math.max(
    0,
    Math.ceil((PROXIMA_PROVA.getTime() - Date.now()) / 86_400_000),
  );
  const taxa = Math.round((painel.acertos / painel.totalQuestoes) * 100);
  const pico = Math.max(...atividade.map((a) => a.n), 1);
  const totalMes = atividade.reduce((s, a) => s + a.n, 0);
  const diasAtivos = atividade.filter((a) => a.n > 0).length;

  const { nivel } = painel;
  const faltaXp = nivel.proximo ? nivel.proximo - painel.xp : 0;
  const pctNivel = nivel.proximo
    ? ((painel.xp - nivel.base) / (nivel.proximo - nivel.base)) * 100
    : 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Seu perfil</h1>
        <p className="mt-2 text-muted">
          Rumo à 1ª fase · prova em {dias} dias
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-4">
        {[
          { n: String(painel.streak), l: "dias seguidos", destaque: true },
          { n: String(painel.nivel.nivel), l: "nível" },
          { n: painel.xp.toLocaleString("pt-BR"), l: "XP" },
          { n: `${taxa}%`, l: "acertos" },
        ].map((s) => (
          <div key={s.l} className="card">
            <p
              className={`tnum font-serif text-3xl font-semibold ${
                s.destaque ? "text-gold" : ""
              }`}
            >
              {s.n}
            </p>
            <p className="mt-1 text-sm text-muted">{s.l}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 className="font-serif text-xl font-semibold">
          Nível {nivel.nivel}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {nivel.proximo
            ? `Faltam ${faltaXp.toLocaleString("pt-BR")} XP para o nível ${nivel.nivel + 1}.`
            : "Você chegou ao topo da tabela."}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${pctNivel}%` }}
          />
        </div>
      </section>

      <section className="card">
        <h2 className="font-serif text-xl font-semibold">Últimos 30 dias</h2>
        <p className="mt-1 text-sm text-muted">
          {totalMes} questões em {diasAtivos}{" "}
          {diasAtivos === 1 ? "dia" : "dias"} de estudo
        </p>
        {/* Barras por dia: mostra padrão de constância melhor que um número. */}
        <div className="mt-5 flex h-24 items-end gap-[3px]">
          {atividade.map((a) => (
            <div
              key={a.dia}
              title={`${a.n} questões`}
              className={`flex-1 rounded-sm ${
                a.n >= META_DIARIA
                  ? "bg-gold"
                  : a.n > 0
                    ? "bg-bordo/40 dark:bg-cream/40"
                    : "bg-bordo/10 dark:bg-white/10"
              }`}
              style={{ height: `${Math.max(4, (a.n / pico) * 100)}%` }}
            />
          ))}
        </div>
        <p className="mt-2 text-[13px] text-muted">
          Barras douradas são dias em que você bateu a meta de {META_DIARIA}{" "}
          questões.
        </p>
      </section>

      <section className="card">
        <h2 className="font-serif text-xl font-semibold">Conquistas</h2>
        <p className="mt-1 text-sm text-muted">
          {painel.conquistas.filter((c) => c.conquistada).length} de{" "}
          {painel.conquistas.length}
        </p>
        <div className="mt-4 space-y-2">
          {painel.conquistas.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                c.conquistada
                  ? "border-gold/50 bg-gold/10"
                  : "border-line opacity-50 dark:border-white/10"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{c.nome}</p>
                <p className="text-[13px] text-muted">{c.descricao}</p>
              </div>
              {c.conquistada && (
                <span className="text-[13px] font-semibold text-gold-text dark:text-gold">
                  conquistada
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <Link href="/progresso" className="btn-ghost w-full">
        Ver desempenho por matéria
      </Link>
    </div>
  );
}
