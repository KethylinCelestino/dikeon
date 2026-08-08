"use client";

/**
 * Repetição espaçada, variante enxuta do SM-2.
 *
 * O SM-2 completo carrega um fator de facilidade por cartão e uma fórmula de
 * intervalo contínua. Aqui o intervalo vem de uma escada fixa, que é mais
 * previsível de depurar e, na prática, rende quase o mesmo para um preparatório
 * de poucos meses — que é o horizonte de quem estuda para a OAB.
 *
 * O estado vive no localStorage. Quando a conta estiver ligada, esta é a
 * próxima coisa a migrar para o banco, no mesmo padrão de progresso.ts.
 */

const CHAVE = "dikeon.srs.v1";

/** Como a pessoa avaliou o próprio acerto ao virar o cartão. */
export type Nota = "errei" | "dificil" | "facil";

export interface EstadoCartao {
  /** Posição na escada de intervalos. */
  nivel: number;
  /** Timestamp da próxima revisão. */
  proxima: number;
  /** Quantas vezes o cartão já foi revisado. */
  vistas: number;
}

// Dias até a próxima revisão, por nível. Errar volta para o começo.
const ESCADA = [0, 1, 3, 7, 16, 35, 75];
const DIA = 86_400_000;

type Mapa = Record<string, EstadoCartao>;

function ler(): Mapa {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as Mapa;
  } catch {
    return {};
  }
}

function gravar(m: Mapa): void {
  localStorage.setItem(CHAVE, JSON.stringify(m));
}

export function avaliar(cartaoId: string, nota: Nota): void {
  if (typeof window === "undefined") return;
  const mapa = ler();
  const atual = mapa[cartaoId] ?? { nivel: 0, proxima: 0, vistas: 0 };

  let nivel: number;
  if (nota === "errei") {
    // Volta ao início: o cartão reaparece ainda nesta sessão.
    nivel = 0;
  } else if (nota === "dificil") {
    // Segura no mesmo intervalo em vez de avançar.
    nivel = Math.max(0, atual.nivel);
  } else {
    nivel = Math.min(atual.nivel + 1, ESCADA.length - 1);
  }

  mapa[cartaoId] = {
    nivel,
    proxima: Date.now() + ESCADA[nivel] * DIA,
    vistas: atual.vistas + 1,
  };
  gravar(mapa);
}

export function estados(): Mapa {
  return ler();
}

/**
 * Monta a sessão: primeiro o que está vencido (mais atrasado antes), depois
 * cartões novos para completar. Sem os novos, quem está em dia abriria a tela
 * e não teria nada para fazer.
 */
export function montarSessao(todosIds: string[], tamanho: number): string[] {
  const mapa = ler();
  const agora = Date.now();

  const vencidos = todosIds
    .filter((id) => mapa[id] && mapa[id].proxima <= agora)
    .sort((a, b) => mapa[a].proxima - mapa[b].proxima);

  const novos = todosIds.filter((id) => !mapa[id]);

  return [...vencidos, ...novos].slice(0, tamanho);
}

export interface ResumoSrs {
  vistos: number;
  vencidos: number;
  novos: number;
  /** Cartões que já subiram na escada e não vencem hoje. */
  emDia: number;
}

export function resumo(todosIds: string[]): ResumoSrs {
  const mapa = ler();
  const agora = Date.now();
  let vencidos = 0;
  let emDia = 0;
  let vistos = 0;
  for (const id of todosIds) {
    const e = mapa[id];
    if (!e) continue;
    vistos++;
    if (e.proxima <= agora) vencidos++;
    else emDia++;
  }
  return {
    vistos,
    vencidos,
    novos: todosIds.length - vistos,
    emDia,
  };
}

export function limparSrs(): void {
  if (typeof window !== "undefined") localStorage.removeItem(CHAVE);
}
