import Link from "next/link";
import { questions, materias, contarPorMateria, exames } from "@/lib/questions";

export default function Home() {
  const contagem = contarPorMateria();
  const totalExames = exames().length;

  return (
    <div className="space-y-12">
      <section className="pt-6">
        <p className="eyebrow">Exame de Ordem Unificado · 1ª fase</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
          Aprovação se constrói
          <br />
          questão por questão.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          {questions.length.toLocaleString("pt-BR")} questões reais da FGV,
          de {totalExames} exames, classificadas por matéria e tema. Pratique
          onde você erra e simule a prova no formato oficial.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/praticar" className="btn-primary">
            Começar a praticar
          </Link>
          <Link href="/simulado" className="btn-ghost">
            Fazer um simulado
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { n: questions.length.toLocaleString("pt-BR"), l: "questões com gabarito" },
          { n: String(totalExames), l: "exames cobertos" },
          { n: String(materias.length), l: "matérias do edital" },
        ].map((s) => (
          <div key={s.l} className="card">
            <p className="font-serif text-3xl font-bold">{s.n}</p>
            <p className="mt-1 text-sm text-muted">{s.l}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Estude por matéria</h2>
        <p className="mt-1 text-sm text-muted">
          A distribuição segue o peso de cada matéria na prova.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {materias.map((m) => (
            <Link
              key={m.id}
              href={`/materias/${m.id}`}
              className="card flex items-center justify-between transition hover:border-navy/30 dark:hover:border-gold/40"
            >
              <div>
                <p className="font-medium">{m.nome}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {m.questoes_tipicas} questões na prova
                </p>
              </div>
              <span className="font-serif text-xl font-bold text-royal dark:text-gold">
                {contagem[m.id] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
