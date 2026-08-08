import Link from "next/link";
import type { Metadata } from "next";
import { Runner } from "./Runner";
import {
  filtrar,
  materias,
  contarPorMateria,
  getMateria,
  nomeMateria,
} from "@/lib/questions";

export const metadata: Metadata = {
  title: "Praticar questões da OAB",
  description:
    "Pratique questões reais da 1ª fase da OAB por matéria, com correção " +
    "imediata e gabarito comentado.",
};

const TAMANHO_SESSAO = 20;

interface Props {
  searchParams: Promise<{ materia?: string; tema?: string }>;
}

export default async function Praticar({ searchParams }: Props) {
  const { materia, tema } = await searchParams;

  if (materia && getMateria(materia)) {
    return (
      <Runner
        questoes={filtrar({ materia, tema })}
        titulo={tema ?? nomeMateria(materia)}
        tamanho={TAMANHO_SESSAO}
        // Muda a cada 30 min: sessoes variam sem quebrar a hidratacao.
        seed={Math.floor(Date.now() / 1_800_000)}
      />
    );
  }

  const contagem = contarPorMateria();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Praticar</h1>
        <p className="mt-2 text-muted">
          Escolha uma matéria. Cada sessão traz {TAMANHO_SESSAO} questões com
          correção na hora.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {materias.map((m) => (
          <Link
            key={m.id}
            href={`/praticar?materia=${m.id}`}
            className="card flex items-center justify-between transition hover:border-navy/30 dark:hover:border-gold/40"
          >
            <div>
              <p className="font-medium">{m.nome}</p>
              <p className="mt-0.5 text-sm text-muted">
                {contagem[m.id] ?? 0} questões
              </p>
            </div>
            <span className="text-muted">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
