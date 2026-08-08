import explicacoesJson from "../../data/explicacoes.json";

/**
 * Explicações geradas por LLM a partir do gabarito oficial. Como o banco tem
 * ~3 mil entradas, este módulo só deve ser importado por Server Components; a
 * explicação da questão em foco é passada por prop para o cliente.
 */
export interface Explicacao {
  /** Por que a alternativa correta é correta. */
  correta: string;
  /** Uma frase por alternativa incorreta, indexada pela letra. */
  erradas: Record<string, string>;
  /** Dispositivo legal central, ex. "art. 5º, LXIII, CF/88". Pode faltar. */
  fundamento: string | null;
}

const explicacoes = explicacoesJson as Record<string, Explicacao>;

export function getExplicacao(id: string): Explicacao | null {
  return explicacoes[id] ?? null;
}

export function mapaExplicacoes(ids: string[]): Record<string, Explicacao> {
  const out: Record<string, Explicacao> = {};
  for (const id of ids) {
    const e = explicacoes[id];
    if (e) out[id] = e;
  }
  return out;
}

export const totalExplicacoes = Object.keys(explicacoes).length;
