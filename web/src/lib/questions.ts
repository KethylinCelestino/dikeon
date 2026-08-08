/**
 * Banco de questoes. Importar este modulo puxa ~5 MB de JSON, entao ele deve
 * ser usado apenas em Server Components. Componentes client importam de
 * `@/lib/tipos`, que traz os mesmos helpers sem os dados.
 */

import questionsJson from "../../data/questions.json";
import { materias, ordemExame, embaralhar, type Question } from "./tipos";

export * from "./tipos";

/** Questoes utilizaveis: descartamos anuladas e as sem gabarito. */
export const questions = (questionsJson as Question[]).filter(
  (q) => !q.anulada && q.correta !== null,
);

const porId = new Map(questions.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return porId.get(id);
}

export interface Filtro {
  materia?: string;
  tema?: string;
  exame?: string;
  /** Por padrao escondemos questoes cuja resposta mudou por alteracao legal. */
  incluirDesatualizadas?: boolean;
}

export function filtrar({
  materia,
  tema,
  exame,
  incluirDesatualizadas = false,
}: Filtro = {}): Question[] {
  return questions.filter((q) => {
    if (materia && q.materia !== materia) return false;
    if (tema && q.tema !== tema) return false;
    if (exame && q.exame !== exame) return false;
    if (!incluirDesatualizadas && q.desatualizada) return false;
    return true;
  });
}

export function contarPorMateria(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of questions) {
    if (!q.materia || q.desatualizada) continue;
    out[q.materia] = (out[q.materia] ?? 0) + 1;
  }
  return out;
}

export function contarPorTema(materia: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const q of questions) {
    if (q.materia !== materia || !q.tema || q.desatualizada) continue;
    out[q.tema] = (out[q.tema] ?? 0) + 1;
  }
  return out;
}

/** Pares matéria+tema com questões, para as páginas de tema. */
export function temasComQuestoes(): { materia: string; tema: string; n: number }[] {
  const contagem = new Map<string, number>();
  for (const q of questions) {
    if (!q.materia || !q.tema || q.desatualizada) continue;
    const k = `${q.materia}::${q.tema}`;
    contagem.set(k, (contagem.get(k) ?? 0) + 1);
  }
  return [...contagem.entries()].map(([k, n]) => {
    const [materia, tema] = k.split("::");
    return { materia, tema, n };
  });
}

export function questoesDoExame(exame: string): Question[] {
  return questions
    .filter((q) => q.exame === exame)
    .sort((a, b) => a.numero - b.numero);
}

export function exames(): string[] {
  return [...new Set(questions.map((q) => q.exame))].sort(
    (a, b) => ordemExame(b) - ordemExame(a),
  );
}

/**
 * Monta um simulado no formato real: 80 questoes distribuidas conforme os
 * pesos do edital, sem repetir questao.
 */
export function montarSimulado(seed: number): Question[] {
  const escolhidas: Question[] = [];
  for (const m of materias) {
    const pool = embaralhar(
      questions.filter((q) => q.materia === m.id && !q.desatualizada),
      seed + m.id.length,
    );
    escolhidas.push(...pool.slice(0, m.questoes_tipicas));
  }
  // Os pesos do edital somam ~79; completamos ate 80 com sorteio livre.
  if (escolhidas.length < 80) {
    const usados = new Set(escolhidas.map((q) => q.id));
    const resto = embaralhar(
      questions.filter((q) => !usados.has(q.id) && !q.desatualizada),
      seed,
    );
    escolhidas.push(...resto.slice(0, 80 - escolhidas.length));
  }
  return embaralhar(escolhidas, seed + 7).slice(0, 80);
}
