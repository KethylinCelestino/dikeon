import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import {
  questions,
  getQuestion,
  nomeMateria,
  rotuloExame,
} from "@/lib/questions";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return questions.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const q = getQuestion(id);
  if (!q) return {};
  return {
    title: `${rotuloExame(q.exame)}, questão ${q.numero} — ${nomeMateria(q.materia)}`,
    description: q.enunciado.slice(0, 155),
    alternates: { canonical: `/questao/${id}` },
  };
}

export default async function QuestaoPage({ params }: Props) {
  const { id } = await params;
  const questao = getQuestion(id);
  if (!questao) notFound();

  const relacionadas = questions
    .filter((q) => q.tema === questao.tema && q.id !== questao.id)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/materias/${questao.materia}`}
          className="text-sm text-muted hover:underline"
        >
          ← {nomeMateria(questao.materia)}
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-bold">
          {rotuloExame(questao.exame)} · questão {questao.numero}
        </h1>
        {questao.tema && <p className="mt-1 text-muted">{questao.tema}</p>}
      </div>

      <QuestionCard questao={questao} />

      {relacionadas.length > 0 && (
        <section>
          <h2 className="font-serif text-lg font-bold">
            Outras questões do mesmo tema
          </h2>
          <ul className="mt-3 space-y-2">
            {relacionadas.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/questao/${q.id}`}
                  className="block rounded-xl border border-line p-3 text-sm transition hover:border-navy/30 dark:border-white/15 dark:hover:border-gold/40"
                >
                  <span className="eyebrow">{rotuloExame(q.exame)}</span>
                  <span className="mt-1 block line-clamp-2 text-muted">
                    {q.enunciado.slice(0, 140)}…
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href={`/praticar?materia=${questao.materia}`} className="btn-primary">
        Praticar {nomeMateria(questao.materia)}
      </Link>
    </div>
  );
}
