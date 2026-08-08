"""Extrai os artigos do Vade Mecum do Senado, diploma por diploma.

O PDF tem três colunas e quebra palavras com hífen no fim da linha. Ao
contrário dos cadernos de prova, a ordem nativa do PDF já é a ordem de leitura
correta — só é preciso remontar as palavras cortadas.

Saída: web/data/vademecum.json

Uso:
    .venv/bin/python pipeline/vademecum.py
    .venv/bin/python pipeline/vademecum.py --so "Código Civil"
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "content" / "vade-mecum" / "Vade_mecum_Senado_Federal_3ed.pdf"
OUT = ROOT / "web" / "data" / "vademecum.json"

# Segmentamos pelo nível 2 do sumário, não pelo nível 1: um "diploma" do
# sumário pode conter mais de uma lei, e cada uma reinicia a numeração dos
# artigos. A Constituição traz o ADCT, o Código Penal traz a Lei das
# Contravenções. Agrupá-los produziria 129 artigos "art. 5" na Constituição.
#
# Casado pelo início do título do nível 2. Índices sistemáticos ficam de fora:
# são sumários e virariam artigos falsos.
DIPLOMAS = [
    ("Constituição da República Federativa do Brasil", "cf", "CF/88"),
    ("Ato das Disposições Constitucionais Transitórias", "adct", "ADCT"),
    ("Lei de Introdução às Normas do Direito Brasileiro", "lindb", "LINDB"),
    ("Código Civil (", "cc", "Código Civil"),
    ("Código de Processo Civil (", "cpc", "CPC"),
    ("Código Penal (", "cp", "Código Penal"),
    ("Lei das Contravenções Penais", "lcp", "Lei das Contravenções Penais"),
    ("Código de Processo Penal (", "cpp", "CPP"),
    ("Código Tributário Nacional (", "ctn", "CTN"),
    ("Código de Defesa do Consumidor (", "cdc", "CDC"),
    ("Consolidação das Leis do Trabalho (", "clt", "CLT"),
]

# "Art. 1o", "Art. 5º", "Art. 1.234", "Art. 22-A"
ART = re.compile(r"^Art\.\s*(\d{1,4}(?:\.\d{3})*(?:\s*[-–]\s*[A-Z])?)\s*[oº°]?\s*")

# Cabeçalhos e rodapés que se repetem em toda página.
RUIDO = re.compile(
    r"^\s*(?:\d{1,4}"
    r"|Constituição da República Federativa do Brasil"
    r"|C[óo]digo [A-ZÀ-Ú][^\n]{0,60}"
    r"|Consolidação das Leis do Trabalho"
    r"|Vade Mecum[^\n]*"
    r")\s*$",
    re.I,
)


def linhas_da_pagina(page: pymupdf.Page) -> list[str]:
    """Linhas na ordem de leitura.

    Diferente dos cadernos de prova, aqui a ordem nativa do PDF já está certa:
    a página tem três colunas e o texto é desenhado coluna a coluna. Reordenar
    por posição (sort=True) ou reconstruir por faixa de y intercala as colunas
    e embaralha os artigos.
    """
    return page.get_text("text").split("\n")


def juntar(linhas: list[str]) -> str:
    """Remonta as palavras que o PDF quebrou com hífen no fim da linha."""
    texto = ""
    for linha in linhas:
        linha = linha.strip()
        if not linha:
            continue
        if texto.endswith("-"):
            # "Constitu-" + "inte" → "Constituinte", mas preserva "ex-" + "sócio"
            texto = texto[:-1] + linha if linha[:1].islower() else texto + linha
        else:
            texto = f"{texto} {linha}" if texto else linha
    return re.sub(r"\s{2,}", " ", texto).strip()


def extrair(doc: pymupdf.Document, inicio: int, fim: int) -> list[dict]:
    """Artigos de um intervalo de páginas (1-indexado, fim exclusivo)."""
    linhas: list[str] = []
    for p in range(inicio - 1, min(fim - 1, len(doc))):
        for linha in linhas_da_pagina(doc[p]):
            linha = linha.strip()
            if linha and not RUIDO.match(linha):
                linhas.append(linha)

    artigos: list[dict] = []
    atual: dict | None = None
    buffer: list[str] = []

    for linha in linhas:
        m = ART.match(linha)
        if m:
            if atual:
                atual["texto"] = juntar(buffer)
                artigos.append(atual)
            numero = re.sub(r"\s*[-–]\s*", "-", m.group(1))
            atual = {"numero": numero}
            buffer = [linha[m.end() :]]
        elif atual:
            buffer.append(linha)

    if atual:
        atual["texto"] = juntar(buffer)
        artigos.append(atual)

    for a in artigos:
        # "Art. 186." deixa o ponto para trás quando o número não traz o "o".
        a["texto"] = re.sub(r"^[.\s]+", "", a["texto"])

    # Artigos sem texto são falso positivo (referência cruzada solta).
    return [a for a in artigos if len(a["texto"]) > 25]


def main() -> None:
    so = None
    if "--so" in sys.argv:
        so = sys.argv[sys.argv.index("--so") + 1]

    doc = pymupdf.open(PDF)
    # Níveis 1 e 2 juntos: o fim de uma seção é o começo da próxima, seja ela
    # do mesmo nível ou do nível acima.
    toc = [t for t in doc.get_toc() if t[0] <= 2]

    saida: dict[str, dict] = {}
    for i, (_nivel, titulo, pagina) in enumerate(toc):
        alvo = next((d for d in DIPLOMAS if titulo.startswith(d[0])), None)
        if not alvo:
            continue
        _, slug, rotulo = alvo
        if so and so not in titulo:
            continue
        fim = toc[i + 1][2] if i + 1 < len(toc) else len(doc) + 1

        artigos = extrair(doc, pagina, fim)
        # A LINDB aparece no sumário nos dois níveis; a entrada de nível 1 só
        # cobre a folha de rosto e não rende artigo nenhum.
        if not artigos:
            continue
        saida[slug] = {
            "slug": slug,
            "nome": titulo,
            "rotulo": rotulo,
            "artigos": artigos,
        }
        print(f"  {rotulo:30} {len(artigos):5} artigos (p.{pagina}-{fim - 1})")

    if so:
        return

    OUT.write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(len(d["artigos"]) for d in saida.values())
    print(f"\n{total} artigos em {len(saida)} diplomas -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
