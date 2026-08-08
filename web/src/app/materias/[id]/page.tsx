import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { materias, getMateria, contarPorTema, filtrar } from "@/lib/questions";
import { flashcardsDaMateria } from "@/lib/flashcards";
import { slugificar } from "@/lib/slug";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return materias.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const m = getMateria(id);
  if (!m) return {};
  const total = filtrar({ materia: id }).length;
  return {
    title: `${m.nome} — questões da OAB`,
    description: `${total} questões de ${m.nome} cobradas na 1ª fase do Exame de Ordem, separadas por tema.`,
    alternates: { canonical: `/materias/${id}` },
  };
}

export default async function MateriaPage({ params }: Props) {
  const { id } = await params;
  const materia = getMateria(id);
  if (!materia) notFound();

  const porTema = contarPorTema(id);
  const total = filtrar({ materia: id }).length;
  const cartoes = flashcardsDaMateria(id).length;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/materias" className="text-sm text-muted hover:underline">
          ← Matérias
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold">{materia.nome}</h1>
        <p className="mt-2 text-muted">
          {total} questões · cerca de {materia.questoes_tipicas} das 80 da prova
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/praticar?materia=${id}`} className="btn-primary">
            Praticar {materia.nome}
          </Link>
          {cartoes > 0 && (
            <Link href={`/flashcards?materia=${id}`} className="btn-ghost">
              {cartoes} flashcards
            </Link>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold">Temas</h2>
        <div className="mt-4 space-y-2">
          {materia.temas.map((tema) => {
            const n = porTema[tema] ?? 0;
            return (
              <Link
                key={tema}
                href={`/materias/${id}/${slugificar(tema)}`}
                className={`flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition dark:border-white/15 ${
                  n
                    ? "hover:border-bordo/30 dark:hover:border-cream/30"
                    : "pointer-events-none opacity-45"
                }`}
              >
                <span>{tema}</span>
                <span className="text-muted">{n}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
