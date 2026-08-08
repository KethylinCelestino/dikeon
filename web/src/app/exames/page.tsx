import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { exames, questoesDoExame, rotuloExame } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Gabaritos das provas da OAB, exame por exame",
  description:
    "Gabaritos oficiais e comentados das provas da 1ª fase do Exame de " +
    "Ordem Unificado, com todas as questões abertas por exame.",
  alternates: { canonical: "/exames" },
};

export default function Exames() {
  const lista = exames().map((e) => {
    const qs = questoesDoExame(e);
    return {
      id: e,
      n: qs.length,
      ano: qs.find((q) => q.data)?.data?.slice(0, 4),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs trilha={[{ nome: "Exames" }]} />
        <h1 className="mt-3 font-serif text-3xl font-semibold">
          Provas anteriores
        </h1>
        <p className="mt-2 max-w-leitura text-muted">
          {lista.length} exames da 1ª fase com gabarito oficial e comentário
          questão a questão.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {lista.map((e) => (
          <Link
            key={e.id}
            href={`/exames/${e.id}`}
            className="card flex items-center justify-between transition hover:border-bordo/30 dark:hover:border-cream/30"
          >
            <div>
              <p className="font-medium">{rotuloExame(e.id)}</p>
              {e.ano && <p className="mt-0.5 text-sm text-muted">{e.ano}</p>}
            </div>
            <span className="tnum shrink-0 text-sm text-muted">
              {e.n} questões
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
