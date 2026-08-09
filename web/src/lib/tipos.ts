/**
 * Tipos e helpers puros, seguros para componentes client.
 *
 * Este modulo NAO importa questions.json de proposito: os componentes client
 * precisam de `embaralhar`/`nomeMateria`, e importa-los de um modulo que
 * carrega o banco de questoes (~5 MB) arrastaria o JSON inteiro para o bundle
 * do navegador. O edital tem 11 KB e pode ir junto.
 */

import editalJson from "../../data/edital.json";

export type Letra = "A" | "B" | "C" | "D";

export interface Question {
  id: string;
  exame: string;
  numero: number;
  data: string | null;
  fonte: string;
  enunciado: string;
  alternativas: Record<string, string>;
  correta: Letra | null;
  anulada: boolean;
  materia: string | null;
  tema: string | null;
  desatualizada?: boolean;
  motivo_desatualizacao?: string | null;
}

/** Espelha lib/explicacoes.ts sem arrastar o JSON para o bundle do cliente. */
export interface Explicacao {
  correta: string;
  erradas: Record<string, string>;
  fundamento: string | null;
}

export interface Flashcard {
  id: string;
  materia: string;
  tema: string;
  frente: string;
  verso: string;
  fundamento: string | null;
}

export interface Materia {
  id: string;
  nome: string;
  questoes_tipicas: number;
  temas: string[];
}

export const edital = editalJson as { materias: Materia[] };
export const materias = edital.materias;

const porMateria = new Map<string, Materia>(materias.map((m) => [m.id, m]));

export function getMateria(id: string | null): Materia | undefined {
  return id ? porMateria.get(id) : undefined;
}

export function nomeMateria(id: string | null): string {
  return getMateria(id)?.nome ?? "Sem classificação";
}

/**
 * Palavras que ficam em minuscula no meio de um titulo. Sao preposicoes,
 * artigos e conjuncoes: capitaliza-las e o que faz Title Case parecer
 * traduzido a maquina.
 */
const MINUSCULAS = new Set([
  "de", "da", "do", "das", "dos", "e", "ou", "em", "no", "na", "nos", "nas",
  "a", "o", "as", "os", "ao", "aos", "à", "às", "para", "por", "com", "sem",
  "sob", "entre",
]);

const LETRA = /[0-9A-Za-zÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç]/;
const SEM_PONTUACAO = /[^0-9A-Za-zÁÉÍÓÚÂÊÔÃÕÇáéíóúâêôãõç/]/g;

/**
 * Converte um tema para Title Case, preservando siglas.
 *
 * Title Case nao e a convencao do portugues — a escolha aqui e de marca, nao
 * de gramatica. O que a funcao evita e o resultado ruim de um `.toUpperCase()`
 * ingenuo: siglas viram "Oab" e "Bpc/Loas", e cada "de"/"da"/"e" ganha
 * maiuscula. Por isso ela olha token a token.
 *
 * Nao mexe em slug nem em URL: `slugificar` normaliza para minusculas antes,
 * entao os links seguem os mesmos.
 */
export function tituloTema(tema: string): string {
  return tema
    .split(" ")
    .map((palavra, i) => {
      // Sigla (ECA, OAB, BPC/LOAS): ja veio em caixa alta, fica como esta.
      const nu = palavra.replace(SEM_PONTUACAO, "");
      if (nu && nu === nu.toUpperCase() && LETRA.test(nu)) return palavra;

      const base = palavra.toLowerCase();
      if (i > 0 && MINUSCULAS.has(base.replace(/[(),.]/g, ""))) return base;

      // Capitaliza a primeira letra, respeitando um "(" ou aspas na frente.
      return base.replace(LETRA, (c) => c.toUpperCase());
    })
    .join(" ");
}

/** Numero do exame para ordenacao ("exame-46" -> 46, "exame-2010-2" -> 0). */
export function ordemExame(id: string): number {
  const m = /^exame-(\d{1,2})$/.exec(id);
  return m ? Number(m[1]) : 0;
}

export function rotuloExame(id: string): string {
  const m = /^exame-(\d{1,2})$/.exec(id);
  return m ? `${m[1]}º Exame` : id.replace("exame-", "Exame ");
}

/**
 * Embaralhamento deterministico (LCG). A seed permite recriar a mesma
 * sessao entre servidor e cliente sem divergencia de hidratacao.
 */
export function embaralhar<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
