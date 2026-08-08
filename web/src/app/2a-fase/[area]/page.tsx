import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AREAS, ehArea, nomeArea, provasDaArea } from "@/lib/segunda-fase";
import { rotuloExame } from "@/lib/questions";

interface Props {
  params: Promise<{ area: string }>;
}

export function generateStaticParams() {
  return AREAS.map((a) => ({ area: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  if (!ehArea(area)) return {};
  const nome = nomeArea(area);
  const n = provasDaArea(area).length;
  return {
    title: `2ª fase da OAB em ${nome}: ${n} provas com padrão de resposta`,
    description:
      `Peças e questões discursivas de ${nome} cobradas na 2ª fase do Exame ` +
      `de Ordem, com o padrão de resposta oficial e a distribuição de pontos.`,
    alternates: { canonical: `/2a-fase/${area}` },
  };
}

export default async function AreaPage({ params }: Props) {
  const { area } = await params;
  if (!ehArea(area)) notFound();

  const provas = provasDaArea(area);
  const nome = nomeArea(area);

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          trilha={[{ nome: "2ª fase", href: "/2a-fase" }, { nome }]}
        />
        <h1 className="mt-3 font-serif text-3xl font-semibold">
          2ª fase · {nome}
        </h1>
        <p className="mt-2 max-w-leitura text-muted">
          {provas.length} provas anteriores. Cada uma traz a peça e as questões
          discursivas com o padrão de resposta da banca.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {provas.map((p) => (
          <Link
            key={p.exame}
            href={`/2a-fase/${area}/${p.exame}`}
            className="card transition hover:border-bordo/30 dark:hover:border-cream/30"
          >
            <p className="font-medium">{rotuloExame(p.exame)}</p>
            <p className="mt-0.5 text-sm text-muted">
              {p.peca ? "peça" : "sem peça"}
              {p.questoes.length > 0 &&
                ` · ${p.questoes.length} ${
                  p.questoes.length === 1 ? "questão" : "questões"
                }`}
              {p.data && ` · ${new Date(`${p.data}T12:00:00`).getFullYear()}`}
            </p>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="font-serif text-xl font-semibold">Outras áreas</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {AREAS.filter((a) => a.slug !== area).map((a) => (
            <Link
              key={a.slug}
              href={`/2a-fase/${a.slug}`}
              className="focavel rounded-full border border-line px-3 py-1.5 text-sm transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
            >
              {a.nome}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
