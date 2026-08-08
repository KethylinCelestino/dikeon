import Link from "next/link";
import type { Metadata } from "next";
import { Runner } from "./Runner";
import {
  filtrar,
  materias,
  contarPorMateria,
  getMateria,
  nomeMateria,
  embaralhar,
} from "@/lib/questions";
import { mapaExplicacoes } from "@/lib/explicacoes";

export const metadata: Metadata = {
  title: "Praticar questões da OAB",
  description:
    "Pratique questões reais da 1ª fase da OAB por matéria, com correção " +
    "imediata e comentário com o fundamento legal.",
};

const TAMANHO_SESSAO = 20;

interface Props {
  searchParams: Promise<{ materia?: string; tema?: string }>;
}

export default async function Praticar({ searchParams }: Props) {
  const { materia, tema } = await searchParams;

  if (materia && getMateria(materia)) {
    // Sorteia e corta no servidor: mandar o acervo inteiro da matéria para o
    // cliente serializava centenas de questões por sessão.
    const sessao = embaralhar(
      filtrar({ materia, tema }),
      // Muda a cada 30 min: sessões variam sem quebrar a hidratação.
      Math.floor(Date.now() / 1_800_000),
    ).slice(0, TAMANHO_SESSAO);

    return (
      <Runner
        questoes={sessao}
        explicacoes={mapaExplicacoes(sessao.map((q) => q.id))}
        titulo={tema ?? nomeMateria(materia)}
      />
    );
  }

  const contagem = contarPorMateria();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Praticar</h1>
        <p className="mt-2 text-muted">
          Escolha uma matéria. Cada sessão traz {TAMANHO_SESSAO} questões com
          correção e comentário na hora.
        </p>
      </div>

      <Link
        href="/revisar"
        className="card flex items-center justify-between transition hover:border-bordo/30 dark:hover:border-cream/30"
      >
        <div>
          <p className="font-medium">Revisar meus erros</p>
          <p className="mt-0.5 text-sm text-muted">
            As questões que você errou, de volta na fila
          </p>
        </div>
        <span className="text-muted">→</span>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2">
        {materias.map((m) => (
          <Link
            key={m.id}
            href={`/praticar?materia=${m.id}`}
            className="card flex items-center justify-between transition hover:border-bordo/30 dark:hover:border-cream/30"
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
