"""Gera flashcards por tema do edital, ancorados nas questões reais da FGV.

Por tema, e não por questão: 194 temas contra 3.157 questões, e o cartão sai
melhor. Um flashcard bom cobre o conceito que a banca cobra repetidamente, não
o enunciado específico de uma prova.

Cada chamada recebe uma amostra das questões daquele tema com seus comentários,
para os cartões refletirem o que a FGV realmente pergunta.

Uso:
    .venv/bin/python pipeline/flashcards.py --limit 3   # amostra
    .venv/bin/python pipeline/flashcards.py             # o que falta
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Lock

import anthropic

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "web" / "data"
OUT = DATA / "flashcards.json"

MODEL = "claude-sonnet-5"
WORKERS = 6
# Amostra de questões por tema: o bastante para mostrar o padrão da banca sem
# estourar o prompt.
AMOSTRA = 8
PRECO_IN, PRECO_OUT = 3.0, 15.0

SYSTEM = """Você escreve flashcards para quem está estudando para o Exame de \
Ordem da OAB.

Recebe um tema do edital e uma amostra de questões reais da FGV sobre ele, com \
os comentários. Devolve de 5 a 8 flashcards que cubram o que a banca cobra \
nesse tema de forma recorrente.

Regras do cartão:
- "frente": uma pergunta direta e específica. Nunca "o que é X?" genérico — \
prefira "Qual o prazo para X?", "Quem tem legitimidade para Y?", "O que \
diferencia A de B?".
- "verso": a resposta completa em 1 a 3 frases. Deve fazer sentido sozinha, \
sem depender da frente.
- "fundamento": o dispositivo legal, curto e citável ("art. 5º, LXIII, CF/88"). \
Use null se não houver dispositivo claro. NUNCA invente número de artigo.

Cada cartão testa UM fato. Se precisar de "e também", vire dois cartões.
Não copie enunciados de questões: extraia a regra que está por trás deles.
Linguagem de revisão, segunda pessoa, sem rodeios.

Responda APENAS com um array JSON:
[{"frente":"...","verso":"...","fundamento":"art. X da Lei Y"}]"""

_uso = {"in": 0, "out": 0}
_lock = Lock()


def gerar_tema(
    client: anthropic.Anthropic,
    materia_nome: str,
    tema: str,
    questoes: list[dict],
    explicacoes: dict,
) -> list[dict]:
    amostra = []
    for q in questoes[:AMOSTRA]:
        e = explicacoes.get(q["id"], {})
        amostra.append(
            {
                "enunciado": q["enunciado"][:700],
                "correta": q["alternativas"].get(q["correta"], "")[:300],
                "comentario": e.get("correta", "")[:300],
                "fundamento": e.get("fundamento"),
            }
        )

    msg = client.messages.create(
        model=MODEL,
        max_tokens=3000,
        thinking={"type": "disabled"},
        system=SYSTEM,
        messages=[
            {
                "role": "user",
                "content": json.dumps(
                    {"materia": materia_nome, "tema": tema, "questoes": amostra},
                    ensure_ascii=False,
                ),
            }
        ],
    )
    with _lock:
        _uso["in"] += msg.usage.input_tokens
        _uso["out"] += msg.usage.output_tokens

    texto = "".join(b.text for b in msg.content if b.type == "text").strip()
    bloco = re.search(r"\[.*\]", texto, re.S)
    if not bloco:
        raise ValueError("resposta sem JSON")
    return json.loads(bloco.group(0))


def main() -> None:
    limite = None
    if "--limit" in sys.argv:
        limite = int(sys.argv[sys.argv.index("--limit") + 1])

    questoes = json.loads((DATA / "questions.json").read_text(encoding="utf-8"))
    explicacoes = json.loads((DATA / "explicacoes.json").read_text(encoding="utf-8"))
    edital = json.loads((ROOT / "pipeline" / "edital.json").read_text(encoding="utf-8"))
    nomes = {m["id"]: m["nome"] for m in edital["materias"]}

    # Agrupa as questões utilizáveis por (matéria, tema).
    por_tema: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for q in questoes:
        if q["tema"] and q["materia"] and not q["desatualizada"] and not q["anulada"]:
            por_tema[(q["materia"], q["tema"])].append(q)

    feitos: dict[str, list[dict]] = {}
    if OUT.exists():
        feitos = json.loads(OUT.read_text(encoding="utf-8"))

    # Temas com poucas questões não dão amostra suficiente para um bom cartão.
    pendentes = [
        (mid, tema, qs)
        for (mid, tema), qs in sorted(por_tema.items())
        if len(qs) >= 3 and f"{mid}::{tema}" not in feitos
    ]
    if limite:
        pendentes = pendentes[:limite]

    print(f"{len(feitos)} temas já feitos, processando {len(pendentes)}")
    if not pendentes:
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("defina ANTHROPIC_API_KEY")
    client = anthropic.Anthropic(api_key=api_key, base_url="https://api.anthropic.com")

    def tarefa(item: tuple[str, str, list[dict]]) -> tuple[str, list[dict]]:
        mid, tema, qs = item
        chave = f"{mid}::{tema}"
        for tentativa in range(3):
            try:
                cartoes = gerar_tema(client, nomes[mid], tema, qs, explicacoes)
                validos = [
                    {
                        "id": f"{chave}::{i}",
                        "materia": mid,
                        "tema": tema,
                        "frente": c["frente"].strip(),
                        "verso": c["verso"].strip(),
                        "fundamento": (c.get("fundamento") or None),
                    }
                    for i, c in enumerate(cartoes)
                    if c.get("frente") and c.get("verso")
                ]
                return chave, validos
            except Exception as exc:  # noqa: BLE001
                if tentativa == 2:
                    print(f"  {chave}: {exc}")
        return chave, []

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for i, (chave, cartoes) in enumerate(pool.map(tarefa, pendentes), 1):
            if cartoes:
                feitos[chave] = cartoes
            if i % 20 == 0 or i == len(pendentes):
                print(f"  {i}/{len(pendentes)} temas")
                OUT.write_text(
                    json.dumps(feitos, ensure_ascii=False, indent=1), encoding="utf-8"
                )

    OUT.write_text(json.dumps(feitos, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(len(v) for v in feitos.values())
    custo = (_uso["in"] * PRECO_IN + _uso["out"] * PRECO_OUT) / 1_000_000
    print(
        f"\n{total} flashcards em {len(feitos)} temas -> {OUT.relative_to(ROOT)}\n"
        f"custo desta rodada: US$ {custo:.2f}"
    )


if __name__ == "__main__":
    main()
