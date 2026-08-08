import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  AREAS,
  contarPorArea,
  listaProvas,
  totalQuestoesDiscursivas,
} from "@/lib/segunda-fase";

export const metadata: Metadata = {
  title: "2ª fase da OAB: peças e questões com padrão de resposta",
  description:
    "Treine a prova prático-profissional da OAB nas sete áreas: peças e " +
    "questões discursivas de provas anteriores, com o padrão de resposta " +
    "oficial da banca e a distribuição de pontos.",
  alternates: { canonical: "/2a-fase" },
};

export default function SegundaFase() {
  const contagem = contarPorArea();

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumbs trilha={[{ nome: "2ª fase" }]} />
        <h1 className="mt-3 font-serif text-3xl font-semibold">
          2ª fase: prova prático-profissional
        </h1>
        <p className="mt-2 max-w-leitura text-muted">
          {listaProvas.length} provas anteriores e {totalQuestoesDiscursivas}{" "}
          questões discursivas, cada uma com o padrão de resposta publicado
          pela banca e a distribuição dos pontos. Escolha a sua área.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {AREAS.map((a) => (
          <Link
            key={a.slug}
            href={`/2a-fase/${a.slug}`}
            className="card flex items-center justify-between transition hover:border-bordo/30 dark:hover:border-cream/30"
          >
            <p className="font-medium">{a.nome}</p>
            <span className="tnum shrink-0 text-sm text-muted">
              {contagem[a.slug] ?? 0} provas
            </span>
          </Link>
        ))}
      </div>

      <section className="card max-w-leitura">
        <h2 className="font-serif text-xl font-semibold">Como a prova é</h2>
        <p className="mt-3 leading-relaxed">
          A 2ª fase tem cinco horas e é feita numa única área, escolhida na
          inscrição. São duas partes: uma <strong>peça prático-profissional</strong>,
          que vale 5 pontos, e <strong>quatro questões discursivas</strong>, que
          valem 1,25 ponto cada. Aprova quem soma 6 dos 10 pontos.
        </p>
        <p className="mt-3 leading-relaxed">
          Diferente da 1ª fase, aqui não há alternativa certa: a nota vem do que
          você escreve. Por isso o padrão de resposta e a distribuição dos
          pontos importam mais que o gabarito — eles mostram exatamente quais
          teses e quais dispositivos a banca esperava ver no texto.
        </p>
      </section>
    </div>
  );
}
