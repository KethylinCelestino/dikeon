import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  questions,
  getQuestion,
  nomeMateria,
  rotuloExame,
} from "@/lib/questions";
import { getExplicacao } from "@/lib/explicacoes";
import { slugificar } from "@/lib/slug";
import { SITE_URL } from "@/lib/seo";

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

  const materia = nomeMateria(q.materia);
  return {
    // O que se digita na busca é "gabarito da questão X do exame Y".
    title: `${rotuloExame(q.exame)}, questão ${q.numero} — gabarito comentado de ${materia}`,
    description:
      `Gabarito e comentário da questão ${q.numero} do ${rotuloExame(q.exame)} ` +
      `da OAB (${materia}${q.tema ? `, ${q.tema}` : ""}): resposta ${q.correta} ` +
      `com o fundamento legal.`,
    alternates: { canonical: `/questao/${id}` },
  };
}

export default async function QuestaoPage({ params }: Props) {
  const { id } = await params;
  const questao = getQuestion(id);
  if (!questao) notFound();

  const explicacao = getExplicacao(questao.id);
  const materia = nomeMateria(questao.materia);
  const correta = questao.correta!;
  const relacionadas = questions
    .filter((q) => q.tema === questao.tema && q.id !== questao.id)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Question",
    name: questao.enunciado.slice(0, 300),
    text: questao.enunciado,
    answerCount: 1,
    acceptedAnswer: {
      "@type": "Answer",
      text: [
        `Alternativa ${correta}: ${questao.alternativas[correta]}`,
        explicacao?.correta,
        explicacao?.fundamento ? `Fundamento: ${explicacao.fundamento}` : null,
      ]
        .filter(Boolean)
        .join(" "),
      url: `${SITE_URL}/questao/${questao.id}`,
    },
    about: { "@type": "Thing", name: materia },
    isPartOf: {
      "@type": "Quiz",
      name: `${rotuloExame(questao.exame)} de Ordem Unificado (OAB/FGV)`,
    },
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Breadcrumbs
          trilha={[
            { nome: "Matérias", href: "/materias" },
            { nome: materia, href: `/materias/${questao.materia}` },
            ...(questao.tema
              ? [
                  {
                    nome: questao.tema,
                    href: `/materias/${questao.materia}/${slugificar(questao.tema)}`,
                  },
                ]
              : []),
            { nome: `Questão ${questao.numero}` },
          ]}
        />
        <h1 className="mt-3 font-serif text-2xl font-semibold">
          {rotuloExame(questao.exame)} · questão {questao.numero}
        </h1>
        <p className="mt-1 text-muted">
          {materia}
          {questao.tema ? ` · ${questao.tema}` : ""}
        </p>
      </div>

      <QuestionCard questao={questao} explicacao={explicacao} />

      {/*
        O gabarito também fora do card interativo. Dentro dele só aparece
        depois de responder, o que o deixa invisível para quem chega pelo
        buscador — e é exatamente o que a pessoa procurou.
      */}
      <section className="max-w-leitura">
        <h2 className="font-serif text-xl font-semibold">Gabarito comentado</h2>
        <p className="mt-3">
          <span className="font-semibold">Resposta correta: {correta}</span>
          {questao.alternativas[correta] && (
            <> — {questao.alternativas[correta]}</>
          )}
        </p>

        {explicacao ? (
          <>
            <p className="texto-justificado mt-3 leading-relaxed">
              {explicacao.correta}
            </p>

            {Object.keys(explicacao.erradas).length > 0 && (
              <>
                <h3 className="mt-5 font-semibold">
                  Por que as outras estão erradas
                </h3>
                <ul className="mt-2 space-y-2">
                  {Object.entries(explicacao.erradas).map(([letra, texto]) => (
                    <li key={letra} className="texto-justificado leading-relaxed">
                      <span className="font-semibold">{letra}) </span>
                      {texto}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {explicacao.fundamento && (
              <p className="mt-4">
                <span className="text-muted">Fundamento: </span>
                <span className="font-medium text-gold-text dark:text-gold">
                  {explicacao.fundamento}
                </span>
              </p>
            )}

            <p className="mt-4 text-[13px] text-muted">
              Comentário gerado por IA a partir do gabarito oficial da FGV.
              Confira o dispositivo antes de usar como fonte.
            </p>
          </>
        ) : (
          <p className="mt-3 text-muted">
            Esta questão ainda não tem comentário.
          </p>
        )}
      </section>

      {relacionadas.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-semibold">
            Outras questões de {questao.tema ?? materia}
          </h2>
          <ul className="mt-3 space-y-2">
            {relacionadas.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/questao/${q.id}`}
                  className="focavel block rounded-xl border border-line p-3 text-sm transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
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

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/praticar?materia=${questao.materia}`}
          className="btn-primary"
        >
          Praticar {materia}
        </Link>
        <Link href={`/exames/${questao.exame}`} className="btn-ghost">
          Ver o {rotuloExame(questao.exame)} completo
        </Link>
      </div>
    </div>
  );
}
