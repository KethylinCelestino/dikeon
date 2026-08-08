import { NextResponse } from "next/server";
import { buscar } from "@/lib/vademecum";

/**
 * Busca no Vade Mecum. Vive no servidor porque são ~6 mil artigos: mandar o
 * corpus inteiro para o navegador custaria vários megabytes.
 */
export async function GET(req: Request) {
  const termo = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json({ resultados: buscar(termo) });
}
