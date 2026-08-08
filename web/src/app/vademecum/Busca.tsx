"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Resultado {
  numero: string;
  texto: string;
  diplomaSlug: string;
  diplomaRotulo: string;
}

export function Busca() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [buscando, setBuscando] = useState(false);

  // Espera a digitação parar antes de consultar, para não disparar uma
  // requisição por tecla.
  useEffect(() => {
    if (termo.trim().length < 2) {
      setResultados(null);
      return;
    }
    setBuscando(true);
    const t = setTimeout(() => {
      fetch(`/api/vademecum?q=${encodeURIComponent(termo)}`)
        .then((r) => r.json())
        .then((d) => setResultados(d.resultados))
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false));
    }, 300);
    return () => clearTimeout(t);
  }, [termo]);

  return (
    <div>
      <input
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="art. 5, usucapião, justa causa…"
        aria-label="Buscar no Vade Mecum"
        className="focavel w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none dark:border-white/15 dark:bg-white/5"
      />

      {buscando && <p className="mt-3 text-sm text-muted">Buscando…</p>}

      {resultados && !buscando && (
        <div className="mt-4 space-y-2">
          {resultados.length === 0 ? (
            <p className="text-sm text-muted">Nada encontrado.</p>
          ) : (
            resultados.map((r) => (
              <Link
                key={`${r.diplomaSlug}-${r.numero}`}
                href={`/vademecum/${r.diplomaSlug}#art-${r.numero}`}
                className="focavel block rounded-xl border border-line p-4 transition hover:border-bordo/30 dark:border-white/15 dark:hover:border-cream/30"
              >
                <p className="eyebrow">
                  {r.diplomaRotulo} · art. {r.numero}
                </p>
                <p className="mt-1 line-clamp-3 text-sm">{r.texto}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
