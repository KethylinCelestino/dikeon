"""Gera explicacoes por alternativa, ancoradas no dispositivo legal.

O gabarito ja e conhecido e vai no prompt: o modelo EXPLICA uma resposta
correta, nao resolve a questao. Isso reduz muito o risco de erro, mas as
citacoes legais ainda podem sair imprecisas — por isso a UI marca o conteudo
como gerado por IA.

Idempotente: questoes ja enriquecidas sao reaproveitadas.

Uso:
    .venv/bin/python pipeline/enrich.py --limit 10   # amostra para avaliar
    .venv/bin/python pipeline/enrich.py              # tudo que falta
    .venv/bin/python pipeline/enrich.py --custo      # so estima o custo
"""

from __future__ import annotations

import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Lock

import anthropic

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "web" / "data"
QUESTOES = DATA / "questions.json"
OUT = DATA / "explicacoes.json"

# Explicacao juridica errada num app de estudo para a OAB e pior do que
# explicacao nenhuma, entao aqui nao economizamos no modelo.
MODEL = "claude-sonnet-5"
BATCH = 5
WORKERS = 6

# Precos por milhao de tokens (USD).
PRECO_IN, PRECO_OUT = 3.0, 15.0

SYSTEM = """Você é professor de cursinho preparatório para o Exame de Ordem \
da OAB e escreve o comentário oficial de questões já corrigidas.

Você RECEBE o gabarito oficial. Sua tarefa é explicar por que ele está certo, \
nunca contestá-lo. Se o gabarito lhe parecer errado, explique mesmo assim o \
raciocínio que o sustenta.

Para cada questão devolva:
- "correta": 1 a 3 frases explicando por que a alternativa correta é correta.
- "erradas": objeto com uma frase por alternativa incorreta, dizendo o erro \
específico de cada uma (não repita "está incorreta").
- "fundamento": o dispositivo legal ou súmula central, no formato curto e \
citável ("art. 5º, LXIII, CF/88", "Súmula 473 do STF", "art. 186 do CC"). \
Use null se a questão for doutrinária ou de filosofia, sem dispositivo claro. \
NUNCA invente número de artigo: na dúvida, use null.

Linguagem de revisão, direta, segunda pessoa ("você"). Sem saudação, sem \
"vamos analisar", sem repetir o enunciado.

Responda APENAS com um array JSON, um objeto por questão, na ordem recebida:
[{"id":"...","correta":"...","erradas":{"A":"...","B":"..."},\
"fundamento":"art. X da Lei Y"}]"""

_uso = {"in": 0, "out": 0}
_lock = Lock()


def enriquecer_lote(client: anthropic.Anthropic, lote: list[dict]) -> list[dict]:
    itens = [
        {
            "id": q["id"],
            "materia": q["materia"],
            "tema": q["tema"],
            "enunciado": q["enunciado"],
            "alternativas": q["alternativas"],
            "gabarito_oficial": q["correta"],
        }
        for q in lote
    ]
    msg = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        # Sem raciocinio estendido: a tarefa e articular a justificativa de um
        # gabarito ja conhecido, nao resolver a questao. Ligado, ele consumia
        # o orcamento de tokens e truncava a resposta.
        thinking={"type": "disabled"},
        system=SYSTEM,
        messages=[{"role": "user", "content": json.dumps(itens, ensure_ascii=False)}],
    )
    with _lock:
        _uso["in"] += msg.usage.input_tokens
        _uso["out"] += msg.usage.output_tokens

    # A resposta pode vir com blocos de raciocinio antes do texto.
    texto = "".join(b.text for b in msg.content if b.type == "text").strip()
    bloco = re.search(r"\[.*\]", texto, re.S)
    if not bloco:
        raise ValueError(f"resposta sem JSON: {texto[:150]}")
    return json.loads(bloco.group(0))


def main() -> None:
    limite = None
    if "--limit" in sys.argv:
        limite = int(sys.argv[sys.argv.index("--limit") + 1])

    questoes = json.loads(QUESTOES.read_text(encoding="utf-8"))
    questoes = [q for q in questoes if not q["anulada"] and q["correta"]]

    feitas: dict[str, dict] = {}
    if OUT.exists():
        feitas = json.loads(OUT.read_text(encoding="utf-8"))

    pendentes = [q for q in questoes if q["id"] not in feitas]

    if "--custo" in sys.argv:
        # Medido na amostra: ~700 tokens de entrada e ~640 de saida por questao.
        custo = len(pendentes) * (700 * PRECO_IN + 640 * PRECO_OUT) / 1_000_000
        print(f"{len(pendentes)} questoes pendentes ≈ US$ {custo:.2f}")
        return

    if limite:
        pendentes = pendentes[:limite]
    print(f"{len(feitas)} ja feitas, processando {len(pendentes)}")
    if not pendentes:
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("defina ANTHROPIC_API_KEY")
    client = anthropic.Anthropic(api_key=api_key, base_url="https://api.anthropic.com")

    lotes = [pendentes[i : i + BATCH] for i in range(0, len(pendentes), BATCH)]

    def tarefa(lote: list[dict]) -> list[dict]:
        for tentativa in range(3):
            try:
                return enriquecer_lote(client, lote)
            except Exception as exc:  # noqa: BLE001
                if tentativa == 2:
                    print(f"  lote falhou: {exc}")
                    return []
        return []

    validas = {q["id"]: q for q in pendentes}
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for i, saida in enumerate(pool.map(tarefa, lotes), 1):
            for r in saida:
                q = validas.get(r.get("id"))
                if not q or not r.get("correta"):
                    continue
                # Só guardamos explicações das alternativas realmente erradas.
                erradas = {
                    k: v
                    for k, v in (r.get("erradas") or {}).items()
                    if k in q["alternativas"] and k != q["correta"]
                }
                feitas[r["id"]] = {
                    "correta": r["correta"],
                    "erradas": erradas,
                    "fundamento": r.get("fundamento") or None,
                }
            if i % 20 == 0 or i == len(lotes):
                print(f"  {i}/{len(lotes)} lotes · {len(feitas)} explicacoes")
                OUT.write_text(
                    json.dumps(feitas, ensure_ascii=False, indent=1), encoding="utf-8"
                )

    OUT.write_text(json.dumps(feitas, ensure_ascii=False, indent=1), encoding="utf-8")
    custo = (_uso["in"] * PRECO_IN + _uso["out"] * PRECO_OUT) / 1_000_000
    n = len(pendentes) or 1
    print(
        f"\n{len(feitas)} explicacoes -> {OUT.relative_to(ROOT)}\n"
        f"tokens: {_uso['in']:,} entrada / {_uso['out']:,} saida"
        f"  ({_uso['in']//n} + {_uso['out']//n} por questao)\n"
        f"custo desta rodada: US$ {custo:.2f}"
    )


if __name__ == "__main__":
    main()
