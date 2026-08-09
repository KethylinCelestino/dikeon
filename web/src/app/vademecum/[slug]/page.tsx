import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDiploma, listaDiplomas } from "@/lib/vademecum";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listaDiplomas.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDiploma(slug);
  if (!d) return {};
  return {
    title: d.nome,
    description: `Texto integral: ${d.nome}, ${d.artigos.length} artigos.`,
    alternates: { canonical: `/vademecum/${slug}` },
  };
}

export default async function DiplomaPage({ params }: Props) {
  const { slug } = await params;
  const diploma = getDiploma(slug);
  if (!diploma) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/vademecum" className="text-sm text-muted hover:underline">
          ← Vade Mecum
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold">
          {diploma.nome}
        </h1>
        <p className="mt-2 text-muted">{diploma.artigos.length} artigos</p>
      </div>

      <div className="max-w-leitura space-y-5">
        {diploma.artigos.map((a) => (
          <article
            key={a.numero}
            // Âncora usada pelos resultados de busca e pelas citações.
            id={`art-${a.numero}`}
            className="scroll-mt-24 border-b border-line pb-5 last:border-0 dark:border-white/10"
          >
            <p className="eyebrow">Art. {a.numero}</p>
            <p className="texto-justificado mt-1.5 text-questao">{a.texto}</p>
          </article>
        ))}
      </div>

      <p className="text-[13px] text-muted">
        Fonte: Vade Mecum do Senado Federal, 3ª edição. Confira a redação
        vigente no portal do Planalto antes de usar como fonte.
      </p>
    </div>
  );
}
