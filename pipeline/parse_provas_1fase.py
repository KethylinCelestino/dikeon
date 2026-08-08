"""Extrai questoes objetivas dos cadernos de 1a fase (FGV) + gabarito definitivo.

Uso:
    .venv/bin/python pipeline/parse_provas_1fase.py                 # todos os exames
    .venv/bin/python pipeline/parse_provas_1fase.py exame-46        # um exame
    .venv/bin/python pipeline/parse_provas_1fase.py exame-46 -v     # com diagnostico

Saida: web/data/questions_raw.json
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PROVAS = ROOT / "content" / "provas"
OUT = ROOT / "web" / "data" / "questions_raw.json"

# Cada exame publica 3-4 tipos de caderno com as mesmas questoes em ordem
# diferente. Parseamos um tipo so e casamos com a coluna correspondente do
# gabarito. Preferimos o tipo 1; alguns PDFs tem fontes sem mapeamento
# Unicode e so um dos tipos extrai texto legivel.
def caderno_tipo(tipo: int) -> re.Pattern:
    return re.compile(
        rf"caderno[-_ ]de[-_ ]prova(?:s)?[-_ ]?(?:tipo[-_ ]?)?0?{tipo}\b", re.I
    )
GABARITO_DEF = re.compile(r"gabarito(?:s)?[-_ ]definitivo", re.I)
GABARITO_PRE = re.compile(r"gabarito(?:s)?[-_ ]preliminar", re.I)

# Linhas de cabecalho/rodape que aparecem em toda pagina.
NOISE = re.compile(
    r"^\s*(?:"
    r"[IVXL\d]+[oº°]?\s*EXAME\s+D[OE]\s+ORDEM.*"
    # Cabecalho "TIPO 1 - BRANCA - Página 9". Em alguns PDFs o numero da
    # pagina e um campo separado e nao sai no texto, por isso ele e opcional
    # nesta variante mas obrigatorio na forma "Página 9" isolada.
    r"|Tipo\s+.{0,30}?P[áa]gina\s*\d*"
    r"|P[áa]gina\s*\d+(?:\s*de\s*\d+)?"
    r"|PROVA APLICADA EM.*"
    r"|Ordem dos Advogados do Brasil"
    r"|Qualquer semelhan[çc]a nominal.*"
    r"|Realiza[çc][ãa]o"
    r")\s*$",
    re.I,
)

# O questionario de percepcao encerra a prova. Casamos a linha-titulo isolada,
# nao a mencao a ele nas instrucoes da capa.
STOP = re.compile(r"^Question[áa]rio de percep[çc][ãa]o sobre a prova$", re.I)

# O marcador de questao varia por epoca: "Questão 1" (ate ~exame-29) ou o
# numero sozinho na linha (exames recentes). Tentamos ambos e ficamos com o
# que render mais questoes.
MARCADORES = (
    re.compile(r"^Quest[ãa]o\s*(\d{1,2})\s*[.\-–]?\s*$", re.I),
    re.compile(r"^(\d{1,2})\s*$"),
)
# Alternativas aparecem como "(A) ..." ou "A) ...".
ALT_LINE = re.compile(r"^\(?([A-E])\)\s*(.*)$")


# Em alguns PDFs o cabecalho da pagina sai grudado no texto da questao, e nao
# como linha propria. Removemos essa faixa onde quer que ela apareca: ela
# nunca faz parte do enunciado.
_COR = r"(?:BRANC[AO]|VERDE|AMAREL[AO]|ROS[AE]|AZUL|CINZA)"
_TIPO = r"(?:PROVA\s+)?TIPO\s*\d*"
_PAG = r"P[ÁA]GINA\s*\d*"
_EO = r"EXAME\s+D[EO]\s+ORDEM(?:\s+UNIFICADO)?"
_SUFIXOS = rf"(?:\s*[–—-]?\s*{_TIPO})?(?:\s*[–—-]?\s*{_COR})?(?:\s*[–—-]?\s*{_PAG})?\s*\d*\s*"
# Letras acentuadas incluidas: sem isso, o numeral romano casa dentro de
# palavras ("no[vo] Exame", "Bras[il] Exame") e come texto legitimo.
_L = r"[A-Za-zÀ-ÿ]"

# O cabecalho da pagina aparece em varias formas e frequentemente chega
# picotado ao texto. Cobrimos tanto a forma completa quanto os rabos que
# sobram quando parte dele ja foi removida como linha isolada.
#
# "Exame de Ordem" tambem aparece DENTRO de enunciados e alternativas (o tema
# e recorrente em Etica), entao a faixa so e tratada como cabecalho quando vem
# acompanhada de um marcador: numeral do exame, caixa alta, edicao "2010.2",
# "Caderno", tipo, cor ou pagina. "aprovacao em Exame de Ordem" fica intacto.
INLINE_NOISE = re.compile(
    "|".join(
        [
            # "XV EXAME DE ORDEM UNIFICADO - TIPO 01 - BRANCA - Página 7"
            rf"\s*(?<!{_L})[IVXL]{{1,6}}(?!{_L})\s*[oº°]?\s*{_EO}{_SUFIXOS}",
            # "42º EXAME DE ORDEM UNIFICADO"
            rf"\s*\d{{1,3}}\s*[oº°]\s*{_EO}{_SUFIXOS}",
            # Capa: "Exame de Ordem Unificado – 2010.2 Caderno de prova"
            rf"\s*{_EO}\s*[–—-]?\s*(?:\d{{4}}\.\d|Caderno)",
            # "EXAME DE ORDEM UNIFICADO - TIPO 1" (sem numeral antes)
            rf"\s*{_EO}\s*[–—-]?\s*(?:{_TIPO}|{_COR}|{_PAG})\s*\d*\s*",
            # Rabo "- TIPO 1 - BRANCO 3": exige tipo E cor para nao pegar
            # texto legitimo.
            rf"\s*[–—-]?\s*{_TIPO}\s*[–—-]?\s*{_COR}\s*\d*\s*",
            # "Página 7" solto.
            rf"\s*[–—-]?\s*{_PAG}\s*",
        ]
    ),
    re.I,
)

# Caixa alta e cabecalho por si so ("XXX EXAME DE ORDEM UNIFICADO"); no corpo
# do enunciado a faixa sempre aparece em caixa mista. Case-sensitive de
# proposito, por isso fora do INLINE_NOISE.
CAIXA_ALTA_NOISE = re.compile(r"\s*EXAME\s+DE\s+ORDEM(?:\s+UNIFICADO)?\s*")


def limpar_cabecalho(s: str) -> str:
    """Remove o cabecalho da pagina que sobrou no meio do texto.

    Aplicado depois de juntar as linhas: a reconstrucao por coluna costuma
    quebrar o cabecalho em pedacos ("IV", "EXAME DE ORDEM UNIFICADO",
    "Página 3") que so voltam a ser contiguos apos a juncao.
    """
    s = CAIXA_ALTA_NOISE.sub(" ", INLINE_NOISE.sub(" ", s))
    return re.sub(r"\s{2,}", " ", s).strip()


def norm(s: str) -> str:
    """Normaliza espacos e caracteres tipograficos."""
    s = s.replace(" ", " ").replace("ﬁ", "fi").replace("ﬂ", "fl")
    s = s.replace("’", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"[ \t]+", " ", s).strip()


def linhas_por_coluna(page: pymupdf.Page) -> list[str]:
    """Reconstroi as linhas de uma pagina de duas colunas a partir das palavras.

    A extracao linear do PyMuPDF intercala as colunas em varios cadernos (e em
    alguns fragmenta a mesma linha visual em blocos soltos). Agrupar palavras
    por coluna e por faixa de y devolve a ordem de leitura correta.
    """
    meio = page.rect.width / 2
    colunas: list[dict[int, list[tuple[float, str]]]] = [{}, {}]
    for x0, y0, x1, y1, palavra, *_ in page.get_text("words"):
        col = 0 if (x0 + x1) / 2 < meio else 1
        # Faixa de 3pt: tolera o jitter de baseline dentro da mesma linha.
        faixa = round(y0 / 3)
        colunas[col].setdefault(faixa, []).append((x0, palavra))

    saida: list[str] = []
    for coluna in colunas:
        for faixa in sorted(coluna):
            palavras = sorted(coluna[faixa], key=lambda p: p[0])
            saida.append(" ".join(p[1] for p in palavras))
    return saida


def page_lines(doc: pymupdf.Document) -> list[str]:
    """Linhas uteis do caderno, ate o questionario de percepcao."""
    lines: list[str] = []
    for page in doc:
        for raw in linhas_por_coluna(page):
            line = norm(raw)
            if not line or NOISE.match(line):
                continue
            if STOP.match(line):
                return lines
            lines.append(line)
    return lines


def split_with(lines: list[str], marcador: re.Pattern) -> dict[int, list[str]]:
    """Agrupa linhas por questao, exigindo numeracao sequencial crescente.

    A exigencia de sequencia evita casar numeros de pagina e numeros soltos
    dentro do enunciado.
    """
    blocks: dict[int, list[str]] = {}
    current: int | None = None
    expected = 1
    for line in lines:
        m = marcador.match(line)
        if m and int(m.group(1)) == expected and expected <= 80:
            current = expected
            expected += 1
            blocks[current] = []
            continue
        if current is not None:
            blocks[current].append(line)
    return blocks


def split_questions(lines: list[str]) -> dict[int, list[str]]:
    """Escolhe o marcador que extrai mais questoes deste caderno."""
    candidatos = [split_with(lines, m) for m in MARCADORES]
    return max(candidatos, key=len)


# Palavras de uma letra que existem em portugues.
LETRAS_VALIDAS = {"a", "e", "o", "à", "é"}
# So minusculas: maiusculas soltas sao legitimas nos enunciados da FGV
# ("Estado X", "Banco Y", "R$", "Sr."), minusculas soltas nao.
ORFAS = re.compile(r"\b[a-zà-ú]\b")


def texto_suspeito(texto: str) -> bool:
    """Detecta questoes corrompidas por camadas de texto sobrepostas no PDF.

    Alguns cadernos (exames 15 e 16) desenham fragmentos parciais de palavras
    alem do texto completo; a reconstrucao por coluna preserva esses restos
    como letras soltas no meio das frases.
    """
    orfas = [w for w in ORFAS.findall(texto) if w not in LETRAS_VALIDAS]
    return len(orfas) >= 2


def parse_block(
    body: list[str], numero: int | None = None
) -> tuple[str, dict[str, str]] | None:
    """Separa enunciado das alternativas (A)-(D)."""
    enunciado: list[str] = []
    alts: dict[str, list[str]] = {}
    letra: str | None = None
    for line in body:
        m = ALT_LINE.match(line)
        if m:
            letra = m.group(1)
            alts[letra] = [m.group(2)] if m.group(2) else []
        elif letra:
            alts[letra].append(line)
        else:
            enunciado.append(line)

    if sorted(alts) != ["A", "B", "C", "D"]:
        return None
    texto = limpar_cabecalho(norm(" ".join(enunciado)))
    # Em alguns exames antigos o marcador da questao anterior vaza para o
    # inicio do bloco ("1 Esculápio, advogado..." na questao 2). So removemos
    # quando o numero e exatamente o da questao anterior, para nao comer um
    # numero legitimo do enunciado.
    if numero is not None:
        texto = re.sub(rf"^{numero - 1}\s+(?=\D)", "", texto)
    opcoes = {k: limpar_cabecalho(norm(" ".join(v))) for k, v in alts.items()}
    if not texto or any(not v for v in opcoes.values()):
        return None
    return texto, opcoes


# Cabecalho que separa os tipos de prova. Varia bastante entre exames:
# "PROVA TIPO 1", "- TIPO 1 - BRANCO", "PROVA 1".
TIPO_HEAD = re.compile(
    r"(?:TIPO\s*[:\-–]?\s*0?(\d)|PROVA\s+0?(\d))\b", re.I
)
# "*", "-" e "ANULADA" marcam questao anulada.
GAB_TOKEN = re.compile(r"ANULAD[AO]|[A-E]\b|\d{1,2}\b|\*|[-–—]")
# Formato legado (ate ~exame-25): tabela mapeando o numero da questao entre
# os quatro tipos de caderno. Nao e seguro deduzir a letra por tipo dela.
TABELA_CORRESP = re.compile(r"TABELA DE CORRESPOND[ÊE]NCIA", re.I)


def parse_gabarito(path: Path, tipo: int = 1) -> dict[int, str]:
    """Le a tabela do gabarito para o tipo de caderno indicado.

    Formato FGV: cabecalho com o tipo, depois blocos alternando uma sequencia
    de numeros de questao e a sequencia de respostas correspondente.
    """
    doc = pymupdf.open(path)
    text = "\n".join(page.get_text("text") for page in doc)
    doc.close()

    # Varios PDFs trazem a tabela de correspondencia depois dos gabaritos.
    # Cortamos ali: dali para frente os numeros sao de outra tabela.
    corresp = TABELA_CORRESP.search(text)
    if corresp:
        text = text[: corresp.start()]
        if not TIPO_HEAD.search(text):
            raise ValueError("so ha tabela-de-correspondencia, sem gabarito direto")

    # Isola o trecho do tipo pedido (ate o cabecalho do proximo tipo).
    heads = [h for h in TIPO_HEAD.finditer(text)]
    if heads:
        chunk = None
        for i, h in enumerate(heads):
            if int(h.group(1) or h.group(2)) == tipo:
                end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
                chunk = text[h.end() : end]
                break
        if chunk is None:
            raise ValueError(f"tipo {tipo} nao encontrado")
    else:
        chunk = text

    # Pareamento por blocos: uma corrida de N numeros e seguida pelas N
    # respostas daquelas questoes. Parear token a token quebraria quando o
    # PDF intercala numeros e letras em ordens diferentes.
    gab: dict[int, str] = {}
    nums: list[int] = []
    respostas: list[str] = []

    def flush() -> None:
        for n, r in zip(nums, respostas):
            gab[n] = r
        nums.clear()
        respostas.clear()

    for tok in GAB_TOKEN.findall(chunk.upper()):
        if tok.isdigit():
            n = int(tok)
            if not 1 <= n <= 80:
                continue
            if respostas:  # terminou o bloco anterior
                flush()
            nums.append(n)
        else:
            anulada = tok.startswith("ANULAD") or tok in ("*", "-", "–", "—")
            respostas.append("X" if anulada else tok)
            if len(respostas) == len(nums):
                flush()
    flush()
    return gab


def parse_exame(exame_dir: Path, verbose: bool = False) -> list[dict]:
    fase1 = exame_dir / "1a-fase"
    if not fase1.is_dir():
        return []

    pdfs = sorted(fase1.glob("*.pdf"))
    gab_path = next((p for p in pdfs if GABARITO_DEF.search(p.name)), None)
    if gab_path is None:
        gab_path = next((p for p in pdfs if GABARITO_PRE.search(p.name)), None)
    if gab_path is None:
        print(f"  {exame_dir.name}: sem gabarito, pulando")
        return []

    melhor: tuple[list[dict], list[int], int, int] | None = None
    for tipo in (1, 2, 3, 4):
        caderno = next((p for p in pdfs if caderno_tipo(tipo).search(p.name)), None)
        if caderno is None:
            continue
        try:
            gab = parse_gabarito(gab_path, tipo)
        except Exception as exc:  # noqa: BLE001
            if verbose:
                print(f"  {exame_dir.name}: gabarito tipo {tipo} ({exc})")
            continue

        doc = pymupdf.open(caderno)
        blocks = split_questions(page_lines(doc))
        doc.close()

        data = re.match(r"(\d{4}-\d{2}-\d{2})", caderno.name)
        out: list[dict] = []
        falhas: list[int] = []
        corrompidas = 0
        for numero in sorted(blocks):
            parsed = parse_block(blocks[numero], numero)
            if parsed is None:
                falhas.append(numero)
                continue
            enunciado, alternativas = parsed
            if texto_suspeito(enunciado + " " + " ".join(alternativas.values())):
                corrompidas += 1
                continue
            correta = gab.get(numero)
            out.append(
                {
                    # O id ignora o tipo de caderno: a questao e a mesma,
                    # so a ordem das alternativas muda entre os tipos.
                    "id": f"{exame_dir.name}-q{numero:02d}",
                    "exame": exame_dir.name,
                    "numero": numero,
                    "tipo_caderno": tipo,
                    "data": data.group(1) if data else None,
                    "fonte": "FGV/OAB",
                    "enunciado": enunciado,
                    "alternativas": alternativas,
                    "correta": correta if correta in ("A", "B", "C", "D") else None,
                    "anulada": correta not in ("A", "B", "C", "D"),
                }
            )

        if melhor is None or len(out) > len(melhor[0]):
            melhor = (out, falhas, tipo, corrompidas)
        if len(out) == 80:
            break

    if melhor is None:
        print(f"  {exame_dir.name}: nenhum caderno legivel, pulando")
        return []

    out, falhas, tipo, corrompidas = melhor

    # Quando a maioria das questoes sai corrompida o problema e o PDF inteiro,
    # e as que passaram provavelmente tem corrupcao sutil demais para a
    # heuristica pegar. Nesses casos descartamos o exame todo.
    if corrompidas > len(out):
        print(
            f"  {exame_dir.name}: descartado, {corrompidas} de "
            f"{corrompidas + len(out)} questoes corrompidas (PDF ruim)"
        )
        return []

    if verbose and falhas:
        print(f"  {exame_dir.name}: falhou em {falhas}")
    validas = sum(1 for q in out if not q["anulada"])
    extra = f" (tipo {tipo})" if tipo != 1 else ""
    if corrompidas:
        extra += f", {corrompidas} descartadas por texto corrompido"
    print(
        f"  {exame_dir.name}: {len(out)}/80 extraidas, "
        f"{validas} com gabarito{extra}"
    )
    return out


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    verbose = "-v" in sys.argv

    if args:
        dirs = [PROVAS / a for a in args]
    else:
        dirs = sorted(d for d in PROVAS.iterdir() if d.is_dir())

    todas: list[dict] = []
    for d in dirs:
        todas.extend(parse_exame(d, verbose))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(todas, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    validas = sum(1 for q in todas if not q["anulada"])
    print(f"\n{len(todas)} questoes ({validas} validas) -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
