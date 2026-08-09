"use client";

import { useEffect, useState } from "react";
import type { Secao } from "@/lib/segunda-fase";

/**
 * Treino de uma peça ou questão discursiva.
 *
 * O fluxo é redigir, corrigir e só então comparar com o padrão. Numa prova
 * discursiva o estudo está em escrever antes de ver a resposta; mostrar tudo
 * de uma vez transforma o treino em leitura passiva.
 */

interface ItemNota {
  item: string;
  obtido: number;
  maximo: number;
  comentario: string;
}

interface Correcao {
  nota: number;
  maximo: number;
  itens: ItemNota[];
  resumo: string;
  faltou: string[];
}

function nota(n: number): string {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function Padrao({
  secao,
  titulo,
  chave,
  correcaoAtiva,
}: {
  secao: Secao;
  titulo: string;
  /** Identifica o rascunho no localStorage. */
  chave: string;
  correcaoAtiva: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [resposta, setResposta] = useState("");
  const [corrigindo, setCorrigindo] = useState(false);
  const [correcao, setCorrecao] = useState<Correcao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const chaveRascunho = `dikeon.rascunho.${chave}`;

  // Recupera o rascunho: perder um texto de prova discursiva por um refresh
  // acidental é frustrante o bastante para desistir do treino.
  useEffect(() => {
    setResposta(localStorage.getItem(chaveRascunho) ?? "");
  }, [chaveRascunho]);

  function escrever(texto: string) {
    setResposta(texto);
    localStorage.setItem(chaveRascunho, texto);
  }

  async function corrigir() {
    setCorrigindo(true);
    setErro(null);
    try {
      const r = await fetch("/api/corrigir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enunciado: secao.enunciado,
          padrao: secao.gabarito,
          pontos: secao.pontos,
          resposta,
        }),
      });
      const d = await r.json();
      if (!r.ok) setErro(d.erro ?? "Não consegui corrigir agora.");
      else {
        setCorrecao(d);
        setAberto(true);
      }
    } catch {
      setErro("Falhou a conexão. Tente de novo.");
    } finally {
      setCorrigindo(false);
    }
  }

  const temPadrao = Boolean(secao.gabarito || secao.pontos);
  const pct = correcao?.maximo ? (correcao.nota / correcao.maximo) * 100 : 0;

  return (
    <article className="card">
      <h2 className="font-serif text-xl font-semibold">{titulo}</h2>

      <p className="texto-justificado mt-4 whitespace-pre-line text-questao">
        {secao.enunciado}
      </p>

      {correcaoAtiva && temPadrao && (
        <div className="mt-6">
          <label
            htmlFor={`resposta-${chave}`}
            className="block text-sm font-medium"
          >
            Sua resposta
          </label>
          <p className="mt-1 text-[13px] text-muted">
            Escreva como escreveria na prova. A correção segue a distribuição
            de pontos publicada pela banca.
          </p>
          <textarea
            id={`resposta-${chave}`}
            value={resposta}
            onChange={(e) => escrever(e.target.value)}
            rows={10}
            placeholder="Redija aqui…"
            className="focavel mt-3 w-full rounded-xl border border-line bg-white p-4 text-[15px] leading-relaxed outline-none dark:border-white/15 dark:bg-white/5"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => void corrigir()}
              disabled={corrigindo || resposta.trim().length < 80}
              className="btn-primary"
            >
              {corrigindo ? "Corrigindo…" : "Corrigir minha resposta"}
            </button>
            <span className="tnum text-[13px] text-muted">
              {resposta.trim().length} caracteres
            </span>
          </div>
          {erro && (
            <p className="mt-3 text-sm text-error dark:text-error-dark">
              {erro}
            </p>
          )}
        </div>
      )}

      {correcao && (
        <section className="mt-6 rounded-xl bg-info-tint p-5 dark:bg-white/5">
          <p className="eyebrow">Correção estimada</p>
          <p className="mt-2 tnum font-serif text-4xl font-semibold">
            {nota(correcao.nota)}
            <span className="text-xl text-muted"> / {nota(correcao.maximo)}</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bordo/10 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${
                pct >= 60 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-error"
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>

          <p className="texto-justificado mt-4 leading-relaxed">
            {correcao.resumo}
          </p>

          {correcao.faltou?.length > 0 && (
            <>
              <h3 className="mt-5 font-semibold">O que faltou</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px]">
                {correcao.faltou.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </>
          )}

          {correcao.itens?.length > 0 && (
            <details className="mt-5">
              <summary className="focavel cursor-pointer text-sm font-medium">
                Pontuação item a item
              </summary>
              <div className="mt-3 space-y-3">
                {correcao.itens.map((it, i) => (
                  <div key={i} className="text-[15px]">
                    <p className="font-medium">
                      <span className="tnum">
                        {it.item}: {nota(it.obtido)} de {nota(it.maximo)}
                      </span>
                    </p>
                    <p className="text-muted">{it.comentario}</p>
                  </div>
                ))}
              </div>
            </details>
          )}

          <p className="mt-4 text-[13px] text-muted">
            Nota estimada por IA a partir do padrão da banca. Serve para
            orientar o estudo, não prevê a nota oficial.
          </p>
        </section>
      )}

      {temPadrao &&
        (aberto ? (
          <div className="mt-6 max-w-leitura border-t border-line pt-6 dark:border-white/10">
            <h3 className="font-serif text-lg font-semibold">
              Padrão de resposta da banca
            </h3>
            <p className="mt-3 whitespace-pre-line text-questao">
              {secao.gabarito || secao.pontos}
            </p>

            {secao.gabarito && secao.pontos && (
              <details className="mt-5">
                <summary className="focavel cursor-pointer text-sm font-medium">
                  Distribuição dos pontos
                </summary>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-muted">
                  {secao.pontos}
                </p>
              </details>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAberto(true)}
            className="btn-ghost mt-6 w-full sm:w-auto"
          >
            Ver o padrão de resposta
          </button>
        ))}
    </article>
  );
}
