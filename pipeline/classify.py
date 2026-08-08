"""Classifica as questoes por materia/tema do edital e sinaliza desatualizacao.

Chama a API da Anthropic em lotes paralelos. Idempotente: questoes ja
classificadas em questions.json sao reaproveitadas, entao da para rodar de
novo depois de acrescentar exames sem repagar o que ja foi feito.

Uso:
    .venv/bin/python pipeline/classify.py            # so o que falta
    .venv/bin/python pipeline/classify.py --all      # reclassifica tudo
"""

from __future__ import annotations

import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "web" / "data"
RAW = DATA / "questions_raw.json"
OUT = DATA / "questions.json"
EDITAL = ROOT / "pipeline" / "edital.json"

MODEL = "claude-haiku-4-5-20251001"
BATCH = 20
WORKERS = 8

SYSTEM = """Você é um especialista no Exame de Ordem da OAB (FGV) e classifica \
questões objetivas.

Para CADA questão recebida, devolva:
- materia: o id exato de uma das matérias do catálogo
- tema: um dos temas listados para aquela matéria (texto exato)
- desatualizada: true se a resposta correta mudou por alteração legislativa ou \
mudança de entendimento sumulado desde a aplicação da prova (ex.: questões de \
processo civil sob o CPC/1973, questões trabalhistas anteriores à Reforma de \
2017, questões penais anteriores ao Pacote Anticrime de 2019). Use false \
quando a questão continua correta hoje.
- motivo_desatualizacao: string curta explicando, ou null.

Responda APENAS com um array JSON, um objeto por questão, na mesma ordem \
recebida, no formato:
[{"id":"...","materia":"...","tema":"...","desatualizada":false,\
"motivo_desatualizacao":null}]"""


def carregar_catalogo() -> tuple[str, dict[str, set[str]]]:
    edital = json.loads(EDITAL.read_text(encoding="utf-8"))
    linhas = []
    validos: dict[str, set[str]] = {}
    for m in edital["materias"]:
        validos[m["id"]] = set(m["temas"])
        linhas.append(f'{m["id"]} ({m["nome"]}):')
        linhas.extend(f"  - {t}" for t in m["temas"])
    return "\n".join(linhas), validos


def classificar_lote(
    client: anthropic.Anthropic, catalogo: str, lote: list[dict]
) -> list[dict]:
    itens = [
        {
            "id": q["id"],
            "data_prova": q.get("data"),
            "enunciado": q["enunciado"][:1200],
            "alternativas": {k: v[:300] for k, v in q["alternativas"].items()},
            "correta": q.get("correta"),
        }
        for q in lote
    ]
    msg = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        system=SYSTEM,
        messages=[
            {
                "role": "user",
                "content": (
                    f"CATÁLOGO DE MATÉRIAS E TEMAS:\n{catalogo}\n\n"
                    f"QUESTÕES:\n{json.dumps(itens, ensure_ascii=False)}"
                ),
            }
        ],
    )
    texto = msg.content[0].text.strip()
    bloco = re.search(r"\[.*\]", texto, re.S)
    if not bloco:
        raise ValueError(f"resposta sem JSON: {texto[:200]}")
    return json.loads(bloco.group(0))


def main() -> None:
    reclassificar_tudo = "--all" in sys.argv

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("defina ANTHROPIC_API_KEY")
    # ANTHROPIC_BASE_URL pode apontar para um proxy local; forcamos a API.
    client = anthropic.Anthropic(
        api_key=api_key, base_url="https://api.anthropic.com"
    )

    catalogo, validos = carregar_catalogo()
    questoes = json.loads(RAW.read_text(encoding="utf-8"))

    # Reaproveitamos so os campos de classificacao, nunca o texto: se o parser
    # melhorou, o enunciado precisa vir novo do questions_raw.json.
    anteriores: dict[str, dict] = {}
    if OUT.exists() and not reclassificar_tudo:
        for q in json.loads(OUT.read_text(encoding="utf-8")):
            if q.get("materia"):
                anteriores[q["id"]] = {
                    "materia": q["materia"],
                    "tema": q.get("tema"),
                    "desatualizada": q.get("desatualizada", False),
                    "motivo_desatualizacao": q.get("motivo_desatualizacao"),
                }

    pendentes = [q for q in questoes if q["id"] not in anteriores]
    print(f"{len(questoes)} questoes, {len(pendentes)} a classificar")

    lotes = [pendentes[i : i + BATCH] for i in range(0, len(pendentes), BATCH)]
    resultados: dict[str, dict] = {}
    falhas = 0

    def tarefa(lote: list[dict]) -> list[dict]:
        for tentativa in range(3):
            try:
                return classificar_lote(client, catalogo, lote)
            except Exception as exc:  # noqa: BLE001
                if tentativa == 2:
                    print(f"  lote falhou: {exc}")
                    return []
        return []

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for i, saida in enumerate(pool.map(tarefa, lotes), 1):
            if not saida:
                falhas += 1
            for r in saida:
                resultados[r["id"]] = r
            if i % 10 == 0 or i == len(lotes):
                print(f"  {i}/{len(lotes)} lotes")

    invalidos = 0
    final = []
    for q in questoes:
        prev = anteriores.get(q["id"])
        if prev:
            final.append({**q, **prev})
            continue
        r = resultados.get(q["id"])
        if r and r.get("materia") in validos:
            tema = r.get("tema")
            if tema not in validos[r["materia"]]:
                tema = None
                invalidos += 1
            q = {
                **q,
                "materia": r["materia"],
                "tema": tema,
                "desatualizada": bool(r.get("desatualizada")),
                "motivo_desatualizacao": r.get("motivo_desatualizacao"),
            }
        else:
            q = {**q, "materia": None, "tema": None, "desatualizada": False}
        final.append(q)

    OUT.write_text(
        json.dumps(final, ensure_ascii=False, indent=1), encoding="utf-8"
    )

    classificadas = sum(1 for q in final if q.get("materia"))
    desatual = sum(1 for q in final if q.get("desatualizada"))
    print(
        f"\n{classificadas}/{len(final)} classificadas "
        f"({desatual} desatualizadas, {invalidos} temas fora do catalogo, "
        f"{falhas} lotes perdidos) -> {OUT.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
