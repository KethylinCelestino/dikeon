# Dikeon

Plataforma de estudo para a 1ª fase do Exame de Ordem da OAB. Questões reais da
FGV classificadas por matéria e tema, prática com correção imediata e simulado
no formato oficial.

Domínio: **dikeon.com.br** · Deploy: Vercel

```
dike/
├── content/            ← fontes (fora do Git, ver "O que fica fora do Git")
│   ├── provas/         ← 45 exames, 1187 PDFs
│   ├── vade-mecum/     ← Vade Mecum do Senado (ainda não processado)
│   └── graduacao/      ← anotações por matéria (fonte para resumos futuros)
├── pipeline/           ← Python: extração e classificação
│   ├── edital.json            ← 18 matérias × temas + pesos na prova
│   ├── parse_provas_1fase.py  ← PDFs → questions_raw.json
│   ├── classify.py            ← + matéria/tema/vigência → questions.json
│   └── enrich.py              ← comentário por questão → explicacoes.json
└── web/                ← Next.js 15 + Tailwind (deploy Vercel)
    ├── data/           ← questions.json, explicacoes.json, edital.json
    └── src/app/        ← /, /praticar, /diagnostico, /revisar, /materias,
                          /simulado, /questao, /progresso
```

## Pipeline

```bash
python3 -m venv .venv
.venv/bin/pip install pymupdf pdfplumber anthropic

.venv/bin/python pipeline/parse_provas_1fase.py        # → web/data/questions_raw.json
ANTHROPIC_API_KEY=... .venv/bin/python pipeline/classify.py   # → web/data/questions.json
ANTHROPIC_API_KEY=... .venv/bin/python pipeline/enrich.py     # → web/data/explicacoes.json
```

`enrich.py --custo` estima o gasto antes de rodar; `--limit N` processa uma
amostra. A rodada completa das 3.157 questões custou US$ 22,71 com Sonnet.

`classify.py` é idempotente: reaproveita a classificação já feita e só chama a
API para questões novas. O texto sempre vem fresco do parser, então melhorias na
extração se propagam sem recusto de classificação.

### Estado atual

**3.179 questões de 41 exames**, todas com gabarito e matéria, e **3.157
comentários** (todas as questões válidas), sendo 94% com dispositivo legal
citado.

Validações que passam:
- distribuição de gabaritos uniforme (A 23,6% · B 26,4% · C 25,2% · D 24,9%)
- distribuição por matéria com desvio máximo de 1,0 questão/exame vs. o edital
- zero resíduo de cabeçalho de página no texto
- nenhum enunciado ou alternativa com texto comido pela limpeza de cabeçalho
- 93 questões sinalizadas como desatualizadas (reforma trabalhista, CPC/2015,
  Pacote Anticrime) e escondidas por padrão

A limpeza de cabeçalho apagava a expressão "Exame de Ordem" onde quer que ela
aparecesse, inclusive no meio de enunciados e alternativas — tema recorrente em
Ética, onde a frase é parte do caso ("após aprovação em Exame de Ordem, ..."). O
filtro agora só trata a faixa como cabeçalho quando vem com um marcador
(numeral do exame, caixa alta, edição "2010.2", "Caderno", tipo, cor ou página).
Recuperou 8 enunciados e 22 alternativas; uma delas ("submeter-se a no .") não
tinha sentido antes. O parser também descarta o marcador da questão anterior
quando ele vaza para o início do bloco, e só quando o número bate com o da
questão anterior.

Lacunas conhecidas:
- **exames 15 e 16** descartados: o PDF tem camadas de texto sobrepostas que
  corrompem a extração (>75% das questões afetadas)
- **exame 12** e **exame 2010-2**: gabarito só existe em formato "tabela de
  correspondência" entre tipos de caderno, cuja leitura não é segura
- 33 questões sem tema (matéria atribuída, tema fora do catálogo)

## Web app

```bash
cd web
pnpm install
pnpm dev
pnpm build
```

Atenção: rodar `pnpm build` com o `pnpm dev` ativo sobrescreve o `.next` e
quebra o dev server. Pare o dev antes de buildar.

### Arquitetura

O banco de questões (5 MB) é importado só por Server Components. Componentes
client importam de `src/lib/tipos.ts`, que traz os mesmos helpers sem os dados —
sem essa separação o JSON inteiro ia para o bundle do navegador (1,43 MB → 110 kB).

## Deploy Vercel

Na importação do projeto, definir **Root Directory = `web`**. Com isso a Vercel
detecta Next.js e pnpm sozinha, sem `vercel.json`.

Depois de conectado ao GitHub, todo push na `main` vira deploy de produção e
todo push em outra branch vira uma preview URL. Não há o que configurar além do
Root Directory.

Variáveis de ambiente necessárias: nenhuma por enquanto (a Fase 1 guarda
progresso no localStorage).

### O que fica fora do Git

`content/` está no `.gitignore`: 705 MB de PDFs da OAB mais 65 MB de anotações
de graduação. O build não precisa deles — o pipeline já produziu
`web/data/questions.json`, que é versionado, junto com `questions_raw.json`,
que permite re-rodar a classificação sem os PDFs.

Os PDFs originais existem só na máquina do Andries. São rebaixáveis de
examedeordem.oab.org.br, mas vale manter uma cópia no Google Drive.

## Próximos passos

**Fase 2 — parcialmente concluída**

Feito: comentários por questão com fundamento legal, `/revisar` (fila de
erros) e `/diagnostico` (ordem de prioridade por matéria).

Bloqueado: auth e persistência. Falta criar as chaves do Clerk **do Dikeon** —
as que existem no workspace são do exame-seguros e autenticariam contra o app
errado. Com elas, migrar `src/lib/progresso.ts` de localStorage para o Neon
(`DB_NEON` já está no `.env`); a interface do módulo foi desenhada para essa
troca.

Pendente também: flashcards com repetição espaçada.

**Fase 3 — ZEL completo**: sessão diária, streak/XP/conquistas, chat da tutora
Zel com contexto do desempenho, Vade Mecum navegável.

**Fase 4 — expansão**: recuperar exames 12/15/16 via OCR ou parse por LLM,
módulo de 2ª fase (peças + padrão de respostas), SEO programático por tema.
