import Anthropic from "@anthropic-ai/sdk";

/**
 * Correção assistida das respostas discursivas da 2ª fase.
 *
 * O critério não é inventado pelo modelo: vai no prompt a distribuição de
 * pontos publicada pela banca, item por item. O modelo confere o que a
 * pessoa escreveu contra essa tabela — é conferência, não julgamento livre,
 * e é o que torna a nota defensável.
 *
 * Sem ANTHROPIC_API_KEY a rota devolve 503 e a interface esconde o recurso.
 */

const MODEL = "claude-sonnet-5";
const MAX_RESPOSTA = 12_000;

const SYSTEM = `Você corrige provas discursivas da 2ª fase do Exame de Ordem \
da OAB, seguindo o padrão da banca examinadora (FGV).

Você recebe o enunciado, o padrão de resposta oficial, a distribuição de \
pontos publicada pela banca e o texto escrito pelo candidato.

Regras da correção:
- Pontue SOMENTE o que está escrito no texto do candidato. Não dê ponto por \
intenção, por conhecimento subentendido nem por tese apenas insinuada.
- Siga os itens da distribuição de pontos na ordem em que aparecem, com a \
pontuação exata prevista para cada um. Onde a banca prevê valores \
intermediários (ex.: 0,00/0,15/0,25), use um deles, nunca um valor fora.
- Citação de dispositivo legal só pontua se o candidato indicar o artigo. \
Mencionar o conteúdo da regra sem citar o artigo vale a fração prevista para \
o conteúdo, não a do dispositivo.
- Seja rigoroso como a banca é, mas explique o que faltou de forma que a \
pessoa consiga corrigir da próxima vez.

Devolva APENAS um objeto JSON:
{"nota": 0.0, "maximo": 0.0, "itens": [{"item": "A1", "obtido": 0.15, \
"maximo": 0.25, "comentario": "..."}], "resumo": "...", "faltou": ["..."]}

"resumo" tem no máximo 3 frases, em segunda pessoa, direto. "faltou" lista as \
teses ou dispositivos ausentes, uma frase curta cada.`;

interface Corpo {
  enunciado?: string;
  padrao?: string;
  pontos?: string;
  resposta?: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ erro: "Correção indisponível" }, { status: 503 });
  }

  let corpo: Corpo;
  try {
    corpo = await req.json();
  } catch {
    return Response.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const resposta = (corpo.resposta ?? "").trim().slice(0, MAX_RESPOSTA);
  if (resposta.length < 80) {
    return Response.json(
      { erro: "Escreva sua resposta antes de pedir a correção." },
      { status: 400 },
    );
  }
  if (!corpo.padrao && !corpo.pontos) {
    return Response.json(
      { erro: "Esta questão não tem padrão de resposta para comparar." },
      { status: 400 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const r = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      thinking: { type: "disabled" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            enunciado: (corpo.enunciado ?? "").slice(0, 6000),
            padrao_de_resposta: (corpo.padrao ?? "").slice(0, 8000),
            distribuicao_de_pontos: (corpo.pontos ?? "").slice(0, 8000),
            resposta_do_candidato: resposta,
          }),
        },
      ],
    });

    const texto = r.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const bloco = texto.match(/\{[\s\S]*\}/);
    if (!bloco) throw new Error("resposta sem JSON");

    return Response.json(JSON.parse(bloco[0]));
  } catch {
    return Response.json(
      { erro: "Não consegui corrigir agora. Tente de novo." },
      { status: 502 },
    );
  }
}
