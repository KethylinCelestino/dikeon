"use client";

import { useState } from "react";
import type { Secao } from "@/lib/segunda-fase";

/**
 * Enunciado da 2ª fase com o padrão de resposta escondido atrás de um clique.
 *
 * Numa prova discursiva o valor do estudo está em redigir antes de ver a
 * resposta; mostrar tudo de uma vez transforma o treino em leitura passiva.
 */
export function Padrao({
  secao,
  titulo,
}: {
  secao: Secao;
  titulo: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <article className="card">
      <h2 className="font-serif text-xl font-semibold">{titulo}</h2>

      <p className="mt-4 max-w-leitura whitespace-pre-line text-questao">
        {secao.enunciado}
      </p>

      {aberto ? (
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
          className="btn-primary mt-6 w-full sm:w-auto"
        >
          Ver o padrão de resposta
        </button>
      )}
    </article>
  );
}
