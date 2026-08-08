import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export interface Passo {
  nome: string;
  /** Ausente no último passo, que é a página atual. */
  href?: string;
}

/**
 * Trilha de navegação, visível e em JSON-LD. O buscador usa o dado
 * estruturado para exibir o caminho no lugar da URL crua no resultado.
 */
export function Breadcrumbs({ trilha }: { trilha: Passo[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ nome: "Início", href: "/" }, ...trilha].map(
      (p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.nome,
        ...(p.href ? { item: `${SITE_URL}${p.href}` } : {}),
      }),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Trilha de navegação" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {trilha.map((p, i) => (
            <li key={p.nome} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {p.href ? (
                <Link href={p.href} className="hover:underline">
                  {p.nome}
                </Link>
              ) : (
                <span>{p.nome}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
