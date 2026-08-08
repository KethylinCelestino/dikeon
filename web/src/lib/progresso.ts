"use client";

/**
 * Progresso local (Fase 1). Guarda tentativas no localStorage para que a
 * pratica funcione sem conta. Na Fase 2 isso migra para Neon via Clerk;
 * a interface aqui foi desenhada para virar chamada de API sem mudar as telas.
 */

const CHAVE = "dikeon.tentativas.v1";

export interface Tentativa {
  questaoId: string;
  materia: string | null;
  escolhida: string;
  acertou: boolean;
  em: number;
}

function ler(): Tentativa[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "[]") as Tentativa[];
  } catch {
    return [];
  }
}

export function registrar(t: Omit<Tentativa, "em">): void {
  if (typeof window === "undefined") return;
  const todas = ler();
  todas.push({ ...t, em: Date.now() });
  // Mantemos as ultimas 5000 para nao estourar a cota do localStorage.
  localStorage.setItem(CHAVE, JSON.stringify(todas.slice(-5000)));
}

export function tentativas(): Tentativa[] {
  return ler();
}

export interface Desempenho {
  total: number;
  acertos: number;
  porMateria: Record<string, { total: number; acertos: number }>;
  respondidas: Set<string>;
}

export function desempenho(): Desempenho {
  const todas = ler();
  const porMateria: Desempenho["porMateria"] = {};
  let acertos = 0;
  for (const t of todas) {
    if (t.acertou) acertos++;
    const k = t.materia ?? "outros";
    porMateria[k] ??= { total: 0, acertos: 0 };
    porMateria[k].total++;
    if (t.acertou) porMateria[k].acertos++;
  }
  return {
    total: todas.length,
    acertos,
    porMateria,
    respondidas: new Set(todas.map((t) => t.questaoId)),
  };
}

export function limpar(): void {
  if (typeof window !== "undefined") localStorage.removeItem(CHAVE);
}
