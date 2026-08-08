import Anthropic from "@anthropic-ai/sdk";
import { nomeMateria } from "@/lib/tipos";

/**
 * Zel, a tutora. Recebe o desempenho do usuário junto com a pergunta para
 * responder sobre o estudo dele, não em abstrato.
 *
 * Sem ANTHROPIC_API_KEY no ambiente a rota devolve 503 e a tela do Zel avisa,
 * no mesmo padrão do Clerk: a IA é um upgrade, não um requisito.
 */



const MODEL = "claude-sonnet-5";
const MAX_MENSAGENS = 20;
const MAX_CARACTERES = 2000;

const SYSTEM = `Você é a Zel, tutora de estudos do Dikeon, uma plataforma de \
preparação para a 1ª fase do Exame de Ordem da OAB.

Fala como uma monitora que já passou na prova: direta, encorajadora, sem \
pompa e sem infantilizar. Português brasileiro, "você", frases curtas.

Toda afirmação jurídica ancora em dispositivo legal ("art. 5º, LXIII, CF/88"). \
Se não tiver certeza do número do artigo, diga o conteúdo da regra sem citar \
número — nunca invente citação.

Você recebe o desempenho da pessoa junto com a pergunta. Use-o: fale das \
matérias em que ela está de fato mal, não de generalidades. Se ela pedir um \
plano, seja concreto quanto a quantidade de questões e ordem das matérias.

Se perguntarem algo fora de estudo para a OAB, redirecione em uma frase.

Responda em no máximo dois parágrafos curtos, salvo se pedirem detalhe.`;

interface Corpo {
  mensagens?: { papel: "user" | "assistant"; texto: string }[];
  desempenho?: {
    total: number;
    acertos: number;
    porMateria: Record<string, { total: number; acertos: number }>;
  };
}

/** Traduz os números crus num resumo curto que cabe no prompt. */
function resumirDesempenho(d: Corpo["desempenho"]): string {
  if (!d || !d.total) return "A pessoa ainda não respondeu nenhuma questão.";

  const linhas = Object.entries(d.porMateria)
    .filter(([, m]) => m.total >= 3)
    .map(([id, m]) => ({ id, taxa: m.acertos / m.total, total: m.total }))
    .sort((a, b) => a.taxa - b.taxa);

  const fmt = (l: typeof linhas) =>
    l
      .map((x) => `${nomeMateria(x.id)} ${Math.round(x.taxa * 100)}% (${x.total} questões)`)
      .join("; ");

  return [
    `Total: ${d.total} questões, ${Math.round((d.acertos / d.total) * 100)}% de acerto.`,
    linhas.length ? `Piores: ${fmt(linhas.slice(0, 5))}.` : "",
    linhas.length > 5 ? `Melhores: ${fmt(linhas.slice(-3).reverse())}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ erro: "Zel indisponível" }, { status: 503 });
  }

  let corpo: Corpo;
  try {
    corpo = await req.json();
  } catch {
    return Response.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const mensagens = (corpo.mensagens ?? [])
    .slice(-MAX_MENSAGENS)
    .filter((m) => m.texto?.trim())
    .map((m) => ({
      role: m.papel === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.texto.slice(0, MAX_CARACTERES),
    }));

  if (!mensagens.length || mensagens[mensagens.length - 1].role !== "user") {
    return Response.json({ erro: "nada a responder" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const r = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      system: `${SYSTEM}\n\nDesempenho da pessoa: ${resumirDesempenho(corpo.desempenho)}`,
      messages: mensagens,
    });
    const texto = r.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return Response.json({ texto });
  } catch {
    return Response.json({ erro: "Não consegui responder agora." }, { status: 502 });
  }
}
