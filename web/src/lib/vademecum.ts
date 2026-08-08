import vademecumJson from "../../data/vademecum.json";

/**
 * Vade Mecum do Senado, 3ª edição, parseado em `pipeline/vademecum.py`.
 * Importar só em Server Components: são ~6 mil artigos.
 */
export interface Artigo {
  numero: string;
  texto: string;
}

export interface Diploma {
  slug: string;
  nome: string;
  /** Rótulo curto usado nas citações do app ("CF/88", "CPC"). */
  rotulo: string;
  artigos: Artigo[];
}

export const diplomas = vademecumJson as Record<string, Diploma>;

export const listaDiplomas: Diploma[] = Object.values(diplomas);

export function getDiploma(slug: string): Diploma | undefined {
  return diplomas[slug];
}

/** Normaliza para busca: sem acento, minúsculo. */
function chave(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export interface Resultado extends Artigo {
  diplomaSlug: string;
  diplomaRotulo: string;
}

/**
 * Busca por número de artigo ou por texto. Número tem prioridade: quem digita
 * "5" quase sempre quer o art. 5º, não os mil artigos que citam o número 5.
 */
export function buscar(termo: string, limite = 40): Resultado[] {
  const q = chave(termo.trim());
  if (q.length < 2) return [];

  const porNumero: Resultado[] = [];
  const porTexto: Resultado[] = [];

  const numero = q.replace(/^art\.?\s*/, "").match(/^(\d{1,4}(?:-[a-z])?)/)?.[1];

  for (const d of listaDiplomas) {
    for (const a of d.artigos) {
      const r: Resultado = {
        ...a,
        diplomaSlug: d.slug,
        diplomaRotulo: d.rotulo,
      };
      if (numero && a.numero.replace(/\./g, "") === numero) {
        porNumero.push(r);
      } else if (porTexto.length < limite && chave(a.texto).includes(q)) {
        porTexto.push(r);
      }
    }
  }

  return [...porNumero, ...porTexto].slice(0, limite);
}
