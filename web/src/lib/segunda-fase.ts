import dadosJson from "../../data/segunda-fase.json";
import { ordemExame } from "./tipos";

/**
 * Provas da 2ª fase, extraídas dos padrões de resposta da FGV.
 * Importar só em Server Components.
 */
export interface Secao {
  /** O caso apresentado ao candidato. */
  enunciado: string;
  /** A resposta esperada, comentada pela banca. */
  gabarito: string;
  /** Tabela de distribuição dos pontos, quando publicada. */
  pontos: string;
  numero?: number;
}

export interface Prova {
  exame: string;
  area: string;
  area_nome: string;
  data: string | null;
  peca: Secao | null;
  questoes: Secao[];
}

const provas = dadosJson as Record<string, Prova>;

export const listaProvas: Prova[] = Object.values(provas);

export const AREAS = [
  { slug: "administrativo", nome: "Direito Administrativo" },
  { slug: "civil", nome: "Direito Civil" },
  { slug: "constitucional", nome: "Direito Constitucional" },
  { slug: "empresarial", nome: "Direito Empresarial" },
  { slug: "penal", nome: "Direito Penal" },
  { slug: "trabalho", nome: "Direito do Trabalho" },
  { slug: "tributario", nome: "Direito Tributário" },
];

export function nomeArea(slug: string): string {
  return AREAS.find((a) => a.slug === slug)?.nome ?? slug;
}

export function ehArea(slug: string): boolean {
  return AREAS.some((a) => a.slug === slug);
}

/** Provas de uma área, da mais recente para a mais antiga. */
export function provasDaArea(area: string): Prova[] {
  return listaProvas
    .filter((p) => p.area === area)
    .sort((a, b) => ordemExame(b.exame) - ordemExame(a.exame));
}

export function getProva(area: string, exame: string): Prova | undefined {
  return provas[`${exame}::${area}`];
}

export function contarPorArea(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of listaProvas) out[p.area] = (out[p.area] ?? 0) + 1;
  return out;
}

export const totalQuestoesDiscursivas = listaProvas.reduce(
  (s, p) => s + p.questoes.length,
  0,
);
