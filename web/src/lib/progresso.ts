"use client";

/**
 * Progresso do usuário, em dois modos.
 *
 * Sem conta, tudo vive no localStorage. Com conta, o servidor é a fonte da
 * verdade e o localStorage continua sendo escrito como cache local — assim a
 * resposta aparece na hora e nada se perde se a rede falhar.
 *
 * O cliente nunca pergunta "estou logado?": ele chama a API e trata 401 como
 * "modo sem conta". Isso faz o módulo funcionar igual antes e depois de o
 * Clerk ser configurado.
 */

const CHAVE = "dikeon.tentativas.v1";
const CHAVE_SYNC = "dikeon.sincronizado.v1";

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

  // Sem await: a UI não deve esperar a gravação remota para seguir.
  void fetch("/api/tentativas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t),
  }).catch(() => {});
}

export function tentativas(): Tentativa[] {
  return ler();
}

export interface Desempenho {
  total: number;
  acertos: number;
  porMateria: Record<string, { total: number; acertos: number }>;
  /** Questões distintas respondidas (uma questão refeita conta uma vez). */
  distintas: number;
  paraRevisar: string[];
  /** true quando os números vieram da conta, não deste navegador. */
  daConta: boolean;
}

function desempenhoLocal(): Desempenho {
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
    distintas: new Set(todas.map((t) => t.questaoId)).size,
    paraRevisar: paraRevisarLocal(),
    daConta: false,
  };
}

/**
 * Questões pendentes de revisão: as que a pessoa errou e ainda não acertou
 * numa tentativa posterior. Acertar depois tira a questão da fila.
 *
 * Ordena pelo erro mais antigo primeiro — quanto mais tempo passou, mais
 * provável que o conteúdo tenha escapado.
 */
function paraRevisarLocal(): string[] {
  const ultima = new Map<string, Tentativa>();
  for (const t of ler()) ultima.set(t.questaoId, t);
  return [...ultima.values()]
    .filter((t) => !t.acertou)
    .sort((a, b) => a.em - b.em)
    .map((t) => t.questaoId);
}

/**
 * Sobe de uma vez o histórico acumulado antes de a pessoa criar conta. Roda
 * no máximo uma vez por navegador; sem isso, quem estudou deslogado perderia
 * o progresso ao entrar.
 */
async function sincronizarUmaVez(): Promise<void> {
  if (localStorage.getItem(CHAVE_SYNC)) return;
  const locais = ler();
  if (!locais.length) {
    localStorage.setItem(CHAVE_SYNC, "1");
    return;
  }
  const r = await fetch("/api/tentativas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      locais.map(({ questaoId, materia, escolhida, acertou }) => ({
        questaoId,
        materia,
        escolhida,
        acertou,
      })),
    ),
  });
  if (r.ok) localStorage.setItem(CHAVE_SYNC, "1");
}

export async function desempenho(): Promise<Desempenho> {
  if (typeof window === "undefined") return desempenhoLocal();

  try {
    const r = await fetch("/api/tentativas");
    if (r.status === 401) return desempenhoLocal(); // modo sem conta
    if (!r.ok) return desempenhoLocal();

    await sincronizarUmaVez();
    // Relê depois do sync para que o histórico recém-enviado já apareça.
    const dados = await (await fetch("/api/tentativas")).json();
    return { ...dados, daConta: true };
  } catch {
    return desempenhoLocal();
  }
}

export async function paraRevisar(): Promise<string[]> {
  return (await desempenho()).paraRevisar;
}

export function limpar(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAVE);
  localStorage.removeItem(CHAVE_SYNC);
}
