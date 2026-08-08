import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo";

// Roda antes da hidratacao para o modo escuro nao piscar branco no carregamento.
const THEME_INIT = `
(function(){try{
  var s=localStorage.getItem('theme');
  var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  if((s||(d?'dark':'light'))==='dark')document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const NAV = [
  { href: "/praticar", label: "Praticar" },
  { href: "/materias", label: "Matérias" },
  { href: "/simulado", label: "Simulado" },
  { href: "/progresso", label: "Progresso" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur dark:border-white/10 dark:bg-navy/85">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy font-serif text-lg font-bold text-gold dark:bg-gold dark:text-navy">
                D
              </span>
              <span className="font-serif text-lg font-bold tracking-tight">
                Dikeon
              </span>
            </Link>
            <nav className="ml-auto hidden items-center gap-1 sm:flex">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-navy/5 hover:text-ink dark:hover:bg-white/10 dark:hover:text-cream"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 sm:hidden dark:border-white/10">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-line px-4 py-8 text-center text-sm text-muted dark:border-white/10">
          <p>
            {SITE_NAME} — questões do Exame de Ordem Unificado, de autoria da
            FGV/OAB, reproduzidas para fins de estudo.
          </p>
        </footer>
      </body>
    </html>
  );
}
