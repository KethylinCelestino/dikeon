"""Extrai as provas da 2a fase a partir dos padroes de resposta da FGV.

O padrao de respostas e uma fonte melhor que o caderno: traz o enunciado, o
gabarito comentado e a distribuicao de pontos no mesmo arquivo, um por area
por exame. O caderno so tem o enunciado.

Saida: web/data/segunda-fase.json

Uso:
    .venv/bin/python pipeline/parse_2a_fase.py
    .venv/bin/python pipeline/parse_2a_fase.py exame-46 -v
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PROVAS = ROOT / "content" / "provas"
OUT = ROOT / "web" / "data" / "segunda-fase.json"

AREAS = {
    "administrativo": "Direito Administrativo",
    "civil": "Direito Civil",
    "constitucional": "Direito Constitucional",
    "empresarial": "Direito Empresarial",
    "penal": "Direito Penal",
    "trabalho": "Direito do Trabalho",
    "tributario": "Direito Tributário",
}

# O definitivo sai depois dos recursos e e o que vale; o preliminar e o
# fallback para os exames em que o definitivo nao foi publicado.
DEFINITIVO = re.compile(r"padrao[-_ ]de[-_ ]respostas?[-_ ]definitivo", re.I)
PRELIMINAR = re.compile(r"padrao[-_ ]de[-_ ]respostas?", re.I)

# Cabeçalho de seção, em três variantes que aparecem ao longo dos exames:
# "PADRÃO DE RESPOSTA – PEÇA PROFISSIONAL", o mesmo com um código de controle
# no fim ("- B002093"), e a forma nua "PEÇA PRÁTICO-PROFISSIONAL" / "QUESTÃO 1".
# O número vem com zero à esquerda em alguns exames ("QUESTÃO 01").
SECAO = re.compile(
    r"^\s*(?:PADR[ÃA]O\s+DE\s+RESPOSTAS?\s*[–—-]\s*)?"
    r"(?:(PE[ÇC]A\s+PR[ÁA]TICO[-\s]?PROFISSIONAL|PE[ÇC]A\s+PROFISSIONAL)"
    r"|QUEST[ÃA]O\s*(\d{1,2}))"
    r"[^\n]{0,30}$",
    re.I | re.M,
)
ENUNCIADO = re.compile(r"^\s*ENUNCIADO\s*$", re.I | re.M)
GABARITO = re.compile(r"^\s*GABARITO\s+COMENTADO\s*$", re.I | re.M)
PONTOS = re.compile(r"^\s*DISTRIBUI[ÇC][ÃA]O\s+D[OE]S?\s+PONTOS?\s*$", re.I | re.M)

# Cabeçalho e rodapé que se repetem em toda página.
RUIDO = re.compile(
    r"^\s*(?:"
    r"ORDEM DOS ADVOGADOS DO BRASIL"
    r"|\d+[oº°]?\s*Exame de Ordem Unificado"
    r"|Prova Pr[áa]tico[- ]?profissional"
    r"|Aplicada em .*"
    r"|P[áa]gina \d+/\d+"
    r"|[ÁA]REA:.*"
    r"|\d+"
    r")\s*$",
    re.I,
)


def limpar(texto: str) -> str:
    """Junta as linhas quebradas pelo PDF e devolve parágrafos legíveis."""
    linhas = [l.strip() for l in texto.split("\n")]
    linhas = [l for l in linhas if l and not RUIDO.match(l)]

    texto = " ".join(linhas)
    texto = re.sub(r"\s{2,}", " ", texto).strip()
    # Itens "A)", "B)" ganham quebra de linha: são a estrutura da resposta.
    texto = re.sub(r"\s(?=[A-E]\)\s)", "\n\n", texto)
    return texto.strip()


def parse_secao(bloco: str) -> dict:
    """Separa enunciado, gabarito comentado e distribuição de pontos."""
    enun, gab, pts = bloco, "", ""

    m = GABARITO.search(bloco)
    if m:
        enun, resto = bloco[: m.start()], bloco[m.end() :]
        m2 = PONTOS.search(resto)
        gab, pts = (resto[: m2.start()], resto[m2.end() :]) if m2 else (resto, "")
    else:
        # Sem "GABARITO COMENTADO" o corte é na distribuição de pontos.
        m2 = PONTOS.search(bloco)
        if m2:
            enun, pts = bloco[: m2.start()], bloco[m2.end() :]

    # O rótulo "ENUNCIADO" some; o que vem antes dele é cabeçalho.
    m3 = ENUNCIADO.search(enun)
    if m3:
        enun = enun[m3.end() :]

    return {
        "enunciado": limpar(enun),
        "gabarito": limpar(gab),
        "pontos": limpar(pts),
    }


def parse_arquivo(caminho: Path) -> dict | None:
    doc = pymupdf.open(caminho)
    texto = "\n".join(p.get_text() for p in doc)
    doc.close()

    marcas = list(SECAO.finditer(texto))
    if not marcas:
        return None

    peca: dict | None = None
    questoes: list[dict] = []

    for i, m in enumerate(marcas):
        fim = marcas[i + 1].start() if i + 1 < len(marcas) else len(texto)
        secao = parse_secao(texto[m.end() : fim])
        if not secao["enunciado"]:
            continue
        if m.group(2):
            secao["numero"] = int(m.group(2))
            questoes.append(secao)
        elif peca is None:
            peca = secao

    if not peca and not questoes:
        return None
    return {"peca": peca, "questoes": sorted(questoes, key=lambda q: q["numero"])}


def pdfs_do_dir(pasta: Path) -> list[Path]:
    """Só os padrões de resposta; cadernos não trazem o gabarito."""
    return [p for p in sorted(pasta.glob("*.pdf")) if PRELIMINAR.search(p.name)]


def area_do_arquivo(nome: str) -> str | None:
    n = nome.lower()
    if "do-trabalho" in n or "trabalho" in n:
        return "trabalho"
    for slug in AREAS:
        if slug in n:
            return slug
    return None


def main() -> None:
    verbose = "-v" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    dirs = (
        [PROVAS / a for a in args]
        if args
        else sorted(d for d in PROVAS.iterdir() if d.is_dir())
    )

    saida: dict[str, dict] = {}
    for exame_dir in dirs:
        fase2 = exame_dir / "2a-fase"
        if not fase2.is_dir():
            continue

        # Pode haver mais de um arquivo por área (preliminar e definitivo).
        # Nos exames antigos o "definitivo" vem num formato de formulário, um
        # bloco por questão, que não traz as seções — então não dá para
        # preferi-lo às cegas: parseamos os candidatos e ficamos com o que
        # render a prova mais completa.
        por_area: dict[str, list[Path]] = {}
        for p in pdfs_do_dir(fase2):
            area = area_do_arquivo(p.name)
            if area:
                por_area.setdefault(area, []).append(p)

        for area, candidatos in sorted(por_area.items()):
            melhor: tuple[dict, Path] | None = None
            for caminho in candidatos:
                dados = parse_arquivo(caminho)
                if not dados:
                    continue
                nota = (
                    len(dados["questoes"]),
                    bool(dados["peca"]),
                    bool(DEFINITIVO.search(caminho.name)),
                )
                if melhor is None or nota > (
                    len(melhor[0]["questoes"]),
                    bool(melhor[0]["peca"]),
                    bool(DEFINITIVO.search(melhor[1].name)),
                ):
                    melhor = (dados, caminho)

            if melhor is None:
                if verbose:
                    print(f"  {exame_dir.name}/{area}: sem seções reconhecidas")
                continue
            dados, caminho = melhor
            data = re.match(r"(\d{4}-\d{2}-\d{2})", caminho.name)
            saida[f"{exame_dir.name}::{area}"] = {
                "exame": exame_dir.name,
                "area": area,
                "area_nome": AREAS[area],
                "data": data.group(1) if data else None,
                **dados,
            }

        if por_area:
            n = sum(
                1 for a in por_area if f"{exame_dir.name}::{a}" in saida
            )
            print(f"  {exame_dir.name}: {n}/{len(por_area)} áreas")

    OUT.write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding="utf-8")
    provas = len(saida)
    com_peca = sum(1 for v in saida.values() if v["peca"])
    questoes = sum(len(v["questoes"]) for v in saida.values())
    print(
        f"\n{provas} provas ({com_peca} com peça, {questoes} questões discursivas)"
        f" -> {OUT.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
