import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { tentativas } from "@/db/schema";
import { usuarioAtual } from "@/lib/auth";

/**
 * Persistência do progresso de quem tem conta. Sem sessão (ou sem auth
 * configurada) responde 401 e o cliente continua no localStorage.
 */

const LETRAS = new Set(["A", "B", "C", "D"]);

interface Entrada {
  questaoId: string;
  materia: string | null;
  escolhida: string;
  acertou: boolean;
}

function valida(t: unknown): t is Entrada {
  const o = t as Entrada;
  return (
    !!o &&
    typeof o.questaoId === "string" &&
    o.questaoId.length <= 40 &&
    typeof o.escolhida === "string" &&
    LETRAS.has(o.escolhida) &&
    typeof o.acertou === "boolean" &&
    (o.materia === null || typeof o.materia === "string")
  );
}

export async function POST(req: Request) {
  const userId = await usuarioAtual();
  if (!userId || !db) {
    return NextResponse.json({ erro: "sem sessão" }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  // Aceita uma tentativa ou um lote: o lote é usado para subir de uma vez o
  // histórico que a pessoa acumulou antes de criar conta.
  const lista = Array.isArray(corpo) ? corpo : [corpo];
  const validas = lista.filter(valida).slice(0, 5000);
  if (!validas.length) {
    return NextResponse.json({ erro: "nada válido para gravar" }, { status: 400 });
  }

  await db.insert(tentativas).values(
    validas.map((t) => ({
      userId,
      questaoId: t.questaoId,
      escolhida: t.escolhida,
      acertou: t.acertou,
      materia: t.materia,
    })),
  );

  return NextResponse.json({ gravadas: validas.length });
}

export async function GET() {
  const userId = await usuarioAtual();
  if (!userId || !db) {
    return NextResponse.json({ erro: "sem sessão" }, { status: 401 });
  }

  // Agregação por matéria no banco: trazer as linhas cruas para somar em JS
  // ficaria caro conforme o histórico cresce.
  const porMateria = await db
    .select({
      materia: tentativas.materia,
      total: sql<number>`count(*)::int`,
      acertos: sql<number>`count(*) filter (where ${tentativas.acertou})::int`,
    })
    .from(tentativas)
    .where(eq(tentativas.userId, userId))
    .groupBy(tentativas.materia);

  // Fila de revisão: questões cuja tentativa mais recente foi um erro.
  const erradas = await db
    .select({ questaoId: tentativas.questaoId })
    .from(tentativas)
    .where(
      and(
        eq(tentativas.userId, userId),
        sql`${tentativas.em} = (
          select max(t2.em) from ${tentativas} t2
          where t2.user_id = ${tentativas.userId}
            and t2.questao_id = ${tentativas.questaoId}
        )`,
        eq(tentativas.acertou, false),
      ),
    )
    .orderBy(tentativas.em);

  const [{ distintas }] = await db
    .select({ distintas: sql<number>`count(distinct ${tentativas.questaoId})::int` })
    .from(tentativas)
    .where(eq(tentativas.userId, userId));

  const total = porMateria.reduce((s, m) => s + m.total, 0);
  const acertos = porMateria.reduce((s, m) => s + m.acertos, 0);

  return NextResponse.json({
    total,
    acertos,
    distintas,
    porMateria: Object.fromEntries(
      porMateria.map((m) => [
        m.materia ?? "outros",
        { total: m.total, acertos: m.acertos },
      ]),
    ),
    paraRevisar: erradas.map((e) => e.questaoId),
  });
}
