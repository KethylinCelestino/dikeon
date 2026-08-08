import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Padrao } from "@/components/Padrao";
import { getProva, listaProvas, nomeArea } from "@/lib/segunda-fase";
import { rotuloExame } from "@/lib/questions";

interface Props {
  params: Promise<{ area: string; exame: string }>;
}

export function generateStaticParams() {
  return listaProvas.map((p) => ({ area: p.area, exame: p.exame }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, exame } = await params;
  const prova = getProva(area, exame);
  if (!prova) return {};

  const nome = nomeArea(area);
  return {
    title: `${rotuloExame(exame)} 2ª fase ${nome} — peça e padrão de resposta`,
    description:
      `Peça prático-profissional e questões discursivas de ${nome} no ` +
      `${rotuloExame(exame)} da OAB, com o padrão de resposta oficial da ` +
      `banca e a distribuição dos pontos.`,
    alternates: { canonical: `/2a-fase/${area}/${exame}` },
  };
}

export default async function ProvaPage({ params }: Props) {
  const { area, exame } = await params;
  const prova = getProva(area, exame);
  if (!prova) notFound();

  const nome = nomeArea(area);
  const dataBr = prova.data
    ? new Date(`${prova.data}T12:00:00`).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs
          trilha={[
            { nome: "2ª fase", href: "/2a-fase" },
            { nome, href: `/2a-fase/${area}` },
            { nome: rotuloExame(exame) },
          ]}
        />
        <h1 className="mt-3 font-serif text-3xl font-semibold">
          {rotuloExame(exame)} · {nome}
        </h1>
        <p className="mt-2 max-w-leitura text-muted">
          Prova prático-profissional{dataBr ? `, aplicada em ${dataBr}` : ""}.
          Leia o caso e redija sua resposta antes de abrir o padrão da banca —
          é escrevendo que esta prova se aprende.
        </p>
      </div>

      {prova.peca && (
        <Padrao secao={prova.peca} titulo="Peça prático-profissional" />
      )}

      {prova.questoes.map((q) => (
        <Padrao
          key={q.numero}
          secao={q}
          titulo={`Questão discursiva ${q.numero}`}
        />
      ))}

      {!prova.peca && prova.questoes.length === 0 && (
        <p className="text-muted">
          O padrão de resposta desta prova não pôde ser extraído do arquivo
          original.
        </p>
      )}

      <p className="text-[13px] text-muted">
        Enunciados e padrões de resposta conforme publicados pela banca no{" "}
        {rotuloExame(exame)}. Material educativo: confira a legislação vigente,
        que pode ter mudado desde a aplicação.
      </p>

      <Link href={`/2a-fase/${area}`} className="btn-ghost">
        Ver outras provas de {nome}
      </Link>
    </div>
  );
}
