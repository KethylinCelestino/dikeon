import Link from "next/link";
import type { Metadata } from "next";
import { listaDiplomas } from "@/lib/vademecum";
import { Busca } from "./Busca";

export const metadata: Metadata = {
  title: "Vade Mecum",
  description:
    "Consulte os textos legais cobrados na 1ª fase da OAB: Constituição, " +
    "Código Civil, CPC, Código Penal, CPP, CLT, CDC, CTN e LINDB.",
};

export default function VadeMecum() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Vade Mecum</h1>
        <p className="mt-2 max-w-leitura text-muted">
          Os diplomas mais cobrados na 1ª fase. Busque por número de artigo
          (&ldquo;art. 5&rdquo;) ou por trecho do texto.
        </p>
      </div>

      <Busca />

      <div className="grid gap-3 sm:grid-cols-2">
        {listaDiplomas.map((d) => (
          <Link
            key={d.slug}
            href={`/vademecum/${d.slug}`}
            className="card flex items-center justify-between transition hover:border-bordo/30 dark:hover:border-cream/30"
          >
            <div>
              <p className="font-medium">{d.rotulo}</p>
              <p className="mt-0.5 text-sm text-muted">{d.nome}</p>
            </div>
            <span className="tnum shrink-0 text-sm text-muted">
              {d.artigos.length} arts.
            </span>
          </Link>
        ))}
      </div>

      <p className="text-[13px] text-muted">
        Fonte: Vade Mecum do Senado Federal, 3ª edição. Antes de usar em prova
        ou na prática, confira a redação vigente no portal do Planalto.
      </p>
    </div>
  );
}
