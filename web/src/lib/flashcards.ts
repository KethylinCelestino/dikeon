import flashcardsJson from "../../data/flashcards.json";
import type { Flashcard } from "./tipos";

/**
 * Flashcards gerados por tema do edital. O arquivo é agrupado por
 * "materia::tema"; aqui achatamos para uma lista com id estável.
 *
 * Só deve ser importado por Server Components.
 */
const porTema = flashcardsJson as Record<string, Flashcard[]>;

export const flashcards: Flashcard[] = Object.values(porTema).flat();

export function flashcardsDaMateria(materia: string): Flashcard[] {
  return flashcards.filter((c) => c.materia === materia);
}

export function contarFlashcardsPorMateria(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of flashcards) {
    out[c.materia] = (out[c.materia] ?? 0) + 1;
  }
  return out;
}
