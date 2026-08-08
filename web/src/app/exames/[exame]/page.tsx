import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  exames,
  nomeMateria,
  questoesDoExame,
  rotuloExame,
} from "@/lib/questions";

interface Props {
  params: Promise<{ exame: string }>;
}

/**
 * Página por exame, com a tabela de gabarito. "Gabarito do 46º exame da OAB"
 * é uma das buscas de maior volume da categoria, e concentra o pico logo
 * depois de cada aplicação.
 */
export function generateStaticParams() {
  return exames().map((exame) => ({ exame }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exame } = await params;
  const questoes = questoesDoExame(exame);
  if (!questoes.length) return {};

  const ano = questoes[0].data?.slice(0, 4);
  return {
    title: `Gabarito do ${rotuloExame(exame)} da OAB — 1ª fase comentada`,
    description:
      `Gabarito oficial e comentado do ${rotuloExame(exame)} de Ordem ` +
      `Unificado${ano ? ` (${ano})` : ""}: ${questoes.length} questões da 1ª ` +
      `fase com resposta e fundamento legal.`,
    alternates: { canonical: `/exames/${exame}` },
  };
}

export default async function ExamePage({ params }: Props) {
  const { exame } = await params;
  const questoes = questoesDoExame(exame);
  if (!questoes.length) notFound();

  const data = questoes.find((q) => q.data)?.data;
  const dataBr = data
    ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR")
    : null;

  // Agrupa por matéria para mostrar a distribuição real daquele exame.
  const porMateria = new Map<string, number>();
  for (const q of questoes) {
    const k = q.materia ?? "outros";
    porMateria.set(k, (porMateria.get(k) ?? 0) + 1);
  }

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          trilha={[
            { nome: "Exames", href: "/exames" },
            { nome: rotuloExame(exame) },
          ]}
        />
        <h1 className="mt-3 font-serif text-3xl font-semibold">
          Gabarito do {rotuloExame(exame)}
        </h1>
        <p className="mt-2 max-w-leitura text-muted">
          {questoes.length} questões da 1ª fase
          {dataBr ? `, aplicadas em ${dataBr}` : ""}. Clique em qualquer questão
          para ver o enunciado com o comentário e o fundamento legal.
        </p>
      </div>

      <section>
        <h2 className="font-serif text-xl font-semibold">Gabarito oficial</h2>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {questoes.map((q) => (
            <Link
              key={q.id}
              href={`/questao/${q.id}`}
              className="focavel rounded-lg border border-line p-2 text-center transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
            >
              <span className="tnum block text-[11px] text-muted">
                {q.numero}
              </span>
              <span className="block font-serif text-lg font-semibold">
                {q.correta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">
          Distribuição por matéria
        </h2>
        <div className="mt-4 space-y-2">
          {[...porMateria.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([mid, n]) => (
              <Link
                key={mid}
                href={`/materias/${mid}`}
                className="focavel flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
              >
                <span>{nomeMateria(mid)}</span>
                <span className="tnum text-muted">{n}</span>
              </Link>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold">Todas as questões</h2>
        <ul className="mt-4 space-y-2">
          {questoes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/questao/${q.id}`}
                className="focavel block rounded-xl border border-line p-4 transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
              >
                <span className="eyebrow">
                  Questão {q.numero} · {nomeMateria(q.materia)} · gabarito{" "}
                  {q.correta}
                </span>
                <span className="mt-1 block line-clamp-2 text-sm">
                  {q.enunciado}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/simulado" className="btn-primary">
        Fazer um simulado no formato da prova
      </Link>
    </div>
  );
}
