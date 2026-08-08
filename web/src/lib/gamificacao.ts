"use client";

/**
 * XP, níveis, streak e conquistas, derivados do histórico já existente.
 *
 * Nada aqui é estado novo guardado à parte: tudo é calculado a partir das
 * tentativas e do estado dos flashcards. Assim não há como o placar divergir
 * do que a pessoa realmente fez, e migrar para o banco depois não exige
 * reconciliar dois lugares.
 */

import { tentativas, type Tentativa } from "./progresso";
import { estados } from "./srs";

/** Meta diária em questões. O guia fala em 25 minutos, mas tempo de tela não
 *  é medida honesta de estudo — questões respondidas é. */
export const META_DIARIA = 20;

const XP_RESPOSTA = 10;
const XP_ACERTO = 10;
const XP_FLASHCARD = 5;

/** XP acumulado para alcançar cada nível. Cresce devagar no começo para o
 *  primeiro nível vir na primeira sessão, e acelera depois. */
const NIVEIS = [
  0, 150, 400, 800, 1400, 2200, 3200, 4500, 6100, 8000, 10200, 12800, 15800,
  19200, 23000,
];

function diaLocal(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface Nivel {
  nivel: number;
  xp: number;
  /** XP em que o nível atual começou. */
  base: number;
  /** XP necessário para o próximo nível, ou null no topo da tabela. */
  proximo: number | null;
}

export function calcularNivel(xp: number): Nivel {
  let nivel = 1;
  for (let i = 1; i < NIVEIS.length; i++) {
    if (xp >= NIVEIS[i]) nivel = i + 1;
  }
  return {
    nivel,
    xp,
    base: NIVEIS[nivel - 1] ?? 0,
    proximo: NIVEIS[nivel] ?? null,
  };
}

/**
 * Sequência de dias consecutivos com alguma atividade. O dia de hoje ainda
 * sem atividade não quebra a sequência — só o dia de ontem vazio quebra,
 * senão a streak "sumiria" toda manhã.
 */
export function calcularStreak(dias: Set<string>): number {
  if (!dias.size) return 0;

  const d = new Date();
  // Se hoje ainda não teve atividade, a contagem começa em ontem.
  if (!dias.has(diaLocal(d.getTime()))) {
    d.setDate(d.getDate() - 1);
    if (!dias.has(diaLocal(d.getTime()))) return 0;
  }

  let streak = 0;
  while (dias.has(diaLocal(d.getTime()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  conquistada: boolean;
}

export interface Painel {
  xp: number;
  nivel: Nivel;
  streak: number;
  /** Questões respondidas hoje. */
  hoje: number;
  metaBatida: boolean;
  totalQuestoes: number;
  acertos: number;
  flashcardsRevisados: number;
  conquistas: Conquista[];
}

export function calcularPainel(): Painel {
  const todas: Tentativa[] = tentativas();
  const srs = estados();
  const flashcardsRevisados = Object.values(srs).reduce(
    (s, e) => s + e.vistas,
    0,
  );

  const acertos = todas.filter((t) => t.acertou).length;
  const xp =
    todas.length * XP_RESPOSTA +
    acertos * XP_ACERTO +
    flashcardsRevisados * XP_FLASHCARD;

  const dias = new Set(todas.map((t) => diaLocal(t.em)));
  const streak = calcularStreak(dias);
  const hojeStr = diaLocal(Date.now());
  const hoje = todas.filter((t) => diaLocal(t.em) === hojeStr).length;

  // Melhor taxa numa matéria com amostra suficiente para significar algo.
  const porMateria = new Map<string, { total: number; acertos: number }>();
  for (const t of todas) {
    const k = t.materia ?? "outros";
    const a = porMateria.get(k) ?? { total: 0, acertos: 0 };
    a.total++;
    if (t.acertou) a.acertos++;
    porMateria.set(k, a);
  }
  const temMateriaForte = [...porMateria.values()].some(
    (m) => m.total >= 20 && m.acertos / m.total >= 0.8,
  );

  const conquistas: Conquista[] = [
    {
      id: "primeiros-passos",
      nome: "Primeiros passos",
      descricao: "Respondeu 10 questões",
      conquistada: todas.length >= 10,
    },
    {
      id: "centena",
      nome: "Centena",
      descricao: "Respondeu 100 questões",
      conquistada: todas.length >= 100,
    },
    {
      id: "milhar",
      nome: "Milhar",
      descricao: "Respondeu 1.000 questões",
      conquistada: todas.length >= 1000,
    },
    {
      id: "constancia",
      nome: "Constância",
      descricao: "7 dias seguidos estudando",
      conquistada: streak >= 7,
    },
    {
      id: "constancia-rara",
      nome: "Constância rara",
      descricao: "30 dias seguidos estudando",
      conquistada: streak >= 30,
    },
    {
      id: "dominio",
      nome: "Domínio",
      descricao: "80% de acertos numa matéria, com pelo menos 20 questões",
      conquistada: temMateriaForte,
    },
    {
      id: "revisor",
      nome: "Revisor",
      descricao: "Revisou 100 flashcards",
      conquistada: flashcardsRevisados >= 100,
    },
  ];

  return {
    xp,
    nivel: calcularNivel(xp),
    streak,
    hoje,
    metaBatida: hoje >= META_DIARIA,
    totalQuestoes: todas.length,
    acertos,
    flashcardsRevisados,
    conquistas,
  };
}

/** Atividade por dia nos últimos N dias, para o gráfico do perfil. */
export function atividadeRecente(dias = 30): { dia: string; n: number }[] {
  const contagem = new Map<string, number>();
  for (const t of tentativas()) {
    const k = diaLocal(t.em);
    contagem.set(k, (contagem.get(k) ?? 0) + 1);
  }

  const saida: { dia: string; n: number }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - (dias - 1));
  for (let i = 0; i < dias; i++) {
    const k = diaLocal(d.getTime());
    saida.push({ dia: k, n: contagem.get(k) ?? 0 });
    d.setDate(d.getDate() + 1);
  }
  return saida;
}
