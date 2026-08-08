import Link from "next/link";
import type { Metadata } from "next";
import { materias, contarPorMateria } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Matérias da 1ª fase da OAB",
  description:
    "As matérias cobradas na 1ª fase do Exame de Ordem, com o número de " +
    "questões de cada uma e o peso na prova.",
};

export default function Materias() {
  const contagem = contarPorMateria();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Matérias</h1>
        <p className="mt-2 text-muted">
          As 18 matérias do edital e quantas questões cada uma costuma ter nas
          80 da prova.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {materias.map((m) => (
          <Link
            key={m.id}
            href={`/materias/${m.id}`}
            className="card transition hover:border-bordo/30 dark:hover:border-cream/30"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium">{m.nome}</p>
              <span className="font-serif text-lg font-semibold text-ink dark:text-cream">
                {contagem[m.id] ?? 0}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {m.questoes_tipicas} na prova · {m.temas.length} temas
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
