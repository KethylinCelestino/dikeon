"use client";

import { useEffect, useState } from "react";
import { desempenho, type Desempenho } from "@/lib/progresso";

export interface Mensagem {
  papel: "user" | "assistant";
  texto: string;
}

export const SUGESTOES = [
  "Analise meus erros e diga por onde começar",
  "Tenho 30 minutos hoje. O que estudo?",
  "Explique controle de constitucionalidade difuso e concentrado",
  "Monte um plano para as próximas duas semanas",
];

/**
 * Estado e envio da conversa com a Zel.
 *
 * Extraído da página para que ela e o botão flutuante compartilhem o mesmo
 * comportamento: duplicar a chamada da API garantiria que uma das duas
 * ficasse para trás na primeira mudança do contrato.
 *
 * Cada superfície mantém a própria conversa — abrir o balão não continua o
 * que foi dito na página /zel. É a expectativa de um chat de canto: pergunta
 * rápida sobre o que está na tela, não a sessão longa de estudo.
 */
export function useZel() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [pensando, setPensando] = useState(false);
  const [dados, setDados] = useState<Desempenho | null>(null);

  useEffect(() => {
    void desempenho().then(setDados);
  }, []);

  async function enviar(texto: string) {
    const limpo = texto.trim();
    if (!limpo || pensando) return;

    const novas: Mensagem[] = [...mensagens, { papel: "user", texto: limpo }];
    setMensagens(novas);
    setPensando(true);

    try {
      const r = await fetch("/api/zel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novas, desempenho: dados }),
      });
      const d = await r.json();
      setMensagens([
        ...novas,
        {
          papel: "assistant",
          texto: d.texto ?? d.erro ?? "Não consegui responder agora.",
        },
      ]);
    } catch {
      setMensagens([
        ...novas,
        { papel: "assistant", texto: "Falhou a conexão. Tente de novo." },
      ]);
    } finally {
      setPensando(false);
    }
  }

  return { mensagens, pensando, enviar };
}
