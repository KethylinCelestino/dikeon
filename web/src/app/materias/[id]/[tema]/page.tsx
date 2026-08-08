import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  filtrar,
  getMateria,
  nomeMateria,
  rotuloExame,
  temasComQuestoes,
} from "@/lib/questions";
import { flashcardsDaMateria } from "@/lib/flashcards";
import { slugificar } from "@/lib/slug";

interface Props {
  params: Promise<{ id: string; tema: string }>;
}

/**
 * Página por tema do edital. É a família de páginas que captura a busca de
 * cauda longa: quem procura "questões de controle de constitucionalidade OAB"
 * quer exatamente isto, e não a matéria inteira.
 */
export function generateStaticParams() {
  return temasComQuestoes().map((t) => ({
    id: t.materia,
    tema: slugificar(t.tema),
  }));
}

/** Resolve o slug de volta para o nome do tema. */
function acharTema(materiaId: string, slug: string): string | null {
  const m = getMateria(materiaId);
  return m?.temas.find((t) => slugificar(t) === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, tema: slug } = await params;
  const tema = acharTema(id, slug);
  if (!tema) return {};

  const n = filtrar({ materia: id, tema }).length;
  return {
    title: `${tema} — ${n} questões da OAB com gabarito`,
    description:
      `${n} questões de ${tema} (${nomeMateria(id)}) já cobradas na 1ª fase ` +
      `do Exame de Ordem, com gabarito comentado e fundamento legal.`,
    alternates: { canonical: `/materias/${id}/${slug}` },
  };
}

export default async function TemaPage({ params }: Props) {
  const { id, tema: slug } = await params;
  const materia = getMateria(id);
  const tema = acharTema(id, slug);
  if (!materia || !tema) notFound();

  const questoes = filtrar({ materia: id, tema });
  if (!questoes.length) notFound();

  const cartoes = flashcardsDaMateria(id).filter((c) => c.tema === tema);

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          trilha={[
            { nome: "Matérias", href: "/materias" },
            { nome: materia.nome, href: `/materias/${id}` },
            { nome: tema },
          ]}
        />
        <h1 className="mt-3 font-serif text-3xl font-semibold">{tema}</h1>
        <p className="mt-2 max-w-leitura text-muted">
          {questoes.length}{" "}
          {questoes.length === 1 ? "questão já cobrada" : "questões já cobradas"}{" "}
          na 1ª fase da OAB sobre {tema.toLowerCase()}, dentro de{" "}
          {materia.nome}. Cada uma com gabarito comentado e o dispositivo legal.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/praticar?materia=${id}&tema=${encodeURIComponent(tema)}`}
            className="btn-primary"
          >
            Praticar este tema
          </Link>
          {cartoes.length > 0 && (
            <Link href={`/flashcards?materia=${id}`} className="btn-ghost">
              {cartoes.length} flashcards
            </Link>
          )}
        </div>
      </div>

      <section>
        <h2 className="font-serif text-xl font-semibold">
          Questões de {tema}
        </h2>
        <ul className="mt-4 space-y-2">
          {questoes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/questao/${q.id}`}
                className="focavel block rounded-xl border border-line p-4 transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
              >
                <span className="eyebrow">
                  {rotuloExame(q.exame)} · questão {q.numero}
                </span>
                <span className="mt-1 block line-clamp-2 text-sm">
                  {q.enunciado}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">
          Outros temas de {materia.nome}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {materia.temas
            .filter((t) => t !== tema)
            .map((t) => (
              <Link
                key={t}
                href={`/materias/${id}/${slugificar(t)}`}
                className="focavel rounded-full border border-line px-3 py-1.5 text-sm transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
              >
                {t}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
