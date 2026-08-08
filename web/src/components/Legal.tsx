/**
 * Moldura das páginas legais. Mantém a medida de leitura e a hierarquia
 * tipográfica do resto do site — documento legal ilegível não protege
 * ninguém.
 */
export function Legal({
  titulo,
  atualizadoEm,
  children,
}: {
  titulo: string;
  atualizadoEm: string;
  children: React.ReactNode;
}) {
  return (
    <article className="max-w-leitura">
      <h1 className="font-serif text-3xl font-semibold">{titulo}</h1>
      <p className="mt-2 text-sm text-muted">
        Última atualização: {atualizadoEm}
      </p>
      <div className="mt-8 space-y-6 leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:font-semibold [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
