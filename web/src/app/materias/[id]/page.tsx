import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { materias, getMateria, contarPorTema, filtrar } from "@/lib/questions";

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

  return (
    <div className="space-y-8">
      <div>
        <Link href="/materias" className="text-sm text-muted hover:underline">
          ← Matérias
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold">{materia.nome}</h1>
        <p className="mt-2 text-muted">
          {total} questões · cerca de {materia.questoes_tipicas} das 80 da prova
        </p>
        <Link href={`/praticar?materia=${id}`} className="btn-primary mt-4">
          Praticar {materia.nome}
        </Link>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold">Temas</h2>
        <div className="mt-4 space-y-2">
          {materia.temas.map((tema) => {
            const n = porTema[tema] ?? 0;
            return (
              <Link
                key={tema}
                href={`/praticar?materia=${id}&tema=${encodeURIComponent(tema)}`}
                className={`flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm transition dark:border-white/15 ${
                  n
                    ? "hover:border-navy/30 dark:hover:border-gold/40"
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
