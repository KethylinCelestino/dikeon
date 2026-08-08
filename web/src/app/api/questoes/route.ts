import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/questions";
import { getExplicacao } from "@/lib/explicacoes";

/**
 * Busca questões por id. Existe porque o histórico do usuário vive no
 * localStorage (Fase 1) — só o cliente sabe o que ele errou, e o banco de
 * questões é grande demais para ir junto para o navegador.
 */

// Teto por requisição: uma sessão de revisão não precisa de mais que isso.
const MAX = 60;

export async function POST(req: Request) {
  let ids: unknown;
  try {
    ({ ids } = await req.json());
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.some((i) => typeof i !== "string")) {
    return NextResponse.json(
      { erro: "Envie { ids: string[] }" },
      { status: 400 },
    );
  }

  const questoes = [];
  const explicacoes: Record<string, unknown> = {};
  for (const id of (ids as string[]).slice(0, MAX)) {
    const q = getQuestion(id);
    if (!q) continue;
    questoes.push(q);
    const e = getExplicacao(id);
    if (e) explicacoes[id] = e;
  }

  return NextResponse.json({ questoes, explicacoes });
}
