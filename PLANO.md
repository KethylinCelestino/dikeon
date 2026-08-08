# Dikeon: Plano Geral do Projeto

**Marca:** Dikeon · **Domínio:** dikeon.com.br

Plataforma de estudo para o Exame de Ordem da OAB (1ª e 2ª fase), com prática de questões reais, plano de estudo diário, gamificação e tutora de IA ("Zel"). Modelo comprovado no projeto `exame-seguros` (pipeline Python → JSON → Next.js na Vercel), com a experiência de produto definida no mockup ZEL.

## 1. Visão

- **Usuário:** bacharel/estudante de Direito se preparando para a 1ª fase da OAB (foco inicial), depois 2ª fase.
- **Proposta de valor:** todas as questões reais FGV organizadas por matéria e tema, com plano diário curto (sessões de ~25 min), revisão inteligente (spaced repetition), simulados no formato real e explicações por IA ancoradas na lei.
- **Referências:**
  - `content/mock-design/zel-fluxo-estudo (1).html`: identidade ZEL, 5 abas (Início, Estudar, IA Zel, Vade Mecum, Perfil), XP/streak/conquistas/ranking, sessão diária, modo foco.
  - `~/code/exame-seguros`: arquitetura de referência (pipeline, stack web, deploy, SEO).

## 2. Ativos de conteúdo (já no repo)

| Ativo | Onde | Uso |
|---|---|---|
| 45 exames, 1187 PDFs (cadernos 1ª fase, gabaritos, cadernos 2ª fase, padrões de resposta) | `content/provas/` + `indice.json` | Banco de questões (1ª fase) e treino discursivo (2ª fase) |
| Vade Mecum Senado 3ª ed. (PDF) | `content/vade-mecum/` | Base do módulo Vade Mecum (CF, CC, CP, CPC, CPP, CLT, CDC, CTN, Estatuto OAB...) |
| Anotações de graduação por matéria (markdown) | `graduacao/` | Matéria-prima para resumos e flashcards por disciplina |

Estimativa do banco: 1ª fase tem 80 questões/exame × 45 exames ≈ **3.600 questões** brutas. Após remover anuladas e questões desatualizadas por mudança legislativa, algo entre 2.500 e 3.000 utilizáveis. Priorizar exames recentes (formato FGV estável, direito vigente): começar do exame-46 para trás.

## 3. Arquitetura

Mesmo desenho do exame-seguros:

```
dike/
├── content/              ← fontes (provas, vade mecum, mock-design)
├── graduacao/            ← anotações (fonte de resumos)
├── pipeline/             ← Python: extração, classificação, enriquecimento
│   ├── parse_provas_1fase.py    → questões + gabarito
│   ├── classify.py              → matéria/tema (LLM)
│   ├── enrich.py                → explicações por alternativa (LLM)
│   ├── parse_vademecum.py       → artigos estruturados
│   └── generate_flashcards.py   → flashcards por tema
└── web/                  ← Next.js 15 + Tailwind + TypeScript (deploy Vercel)
    ├── data/             ← questions.json, vademecum.json, flashcards.json
    ├── content/          ← resumos markdown por matéria
    └── src/app/          ← rotas
```

**Stack (idêntica ao exame-seguros, já validada):**
- Next.js 15 (App Router) + React 19 + Tailwind, dark mode
- Auth: Clerk
- DB: Neon Postgres + Drizzle (tentativas, streaks, XP, SRS, simulados)
- Conteúdo estático (questões, resumos, vade mecum) em JSON/markdown no repo, não no DB
- IA: Claude API (explicações pré-geradas em batch no pipeline; chat da Zel em runtime via route handler)
- Deploy: Vercel (`vercel.json` apontando build para `web/`)

## 4. Pipeline de conteúdo

### 4.1 Questões 1ª fase
1. **Parse:** extrair questões dos cadernos (pdfplumber/pymupdf). Atenção: cada exame tem 3-4 versões de caderno (mesmas questões, ordem trocada); parsear só o caderno tipo 1 e casar com o gabarito definitivo correspondente. Exames antigos (até ~exame-13) com layout diferente: parse via LLM (Haiku em subagentes, como feito no exame-seguros).
2. **Gabarito:** cruzar com `gabaritos-definitivos`; marcar questões anuladas.
3. **Classificação (LLM):** matéria (as ~17 do edital: Ética, Constitucional, Direitos Humanos, Civil, Processo Civil, Penal, Processo Penal, Trabalho, Processo do Trabalho, Administrativo, Tributário, Empresarial, Consumidor, ECA, Ambiental, Internacional, Filosofia) + tema dentro da matéria.
4. **Triagem de vigência (LLM):** flag "desatualizada" para questões afetadas por reforma legislativa (ex.: questões de Processo Civil pré-CPC/2015, reforma trabalhista, pacote anticrime). Exibir com aviso ou excluir.
5. **Enriquecimento (LLM, batch):** explicação da correta + por que cada errada está errada, com âncora no dispositivo legal (art. X da lei Y). Isso alimenta o "Dica da Zel" do mockup.
6. **Dedup e QA:** mesmo padrão de `merge_questions.py` / `cleanup_questions.py` do exame-seguros.

Saída: `web/data/questions.json` com `{id, exame, numero, materia, tema, enunciado, alternativas[A-D], correta, anulada, desatualizada, explicacao, fundamentacao}`.

### 4.2 Vade Mecum
- Parsear o PDF do Senado nos principais diplomas para o MVP do módulo (CF/88, Estatuto da OAB + Código de Ética, CC, CPC, CP, CPP, CLT, CDC, CTN), estrutura por artigo, busca, favoritos.
- Cada explicação de questão linka para o artigo interno + fonte oficial (Planalto), como no mockup.

### 4.3 Resumos e flashcards
- Resumos por matéria a partir de `graduacao/` (curados/reescritos por LLM em linguagem de revisão OAB).
- Flashcards gerados por tema + a partir de questões erradas (mesmos scripts-base do exame-seguros, incluindo SRS).

### 4.4 2ª fase (fase posterior)
- Cadernos + padrões de resposta por área já organizados. Produto: banco de peças e questões discursivas por área, com autoavaliação guiada pelo padrão de respostas e, depois, correção assistida por IA.

## 5. Produto: fases de entrega

### Fase 0: Fundação de conteúdo (pipeline) — CONCLUÍDA
- Parse + gabarito dos exames 26-46 (~1.680 questões, formato estável, direito recente).
- Classificação por matéria/tema. Sem enriquecimento ainda.
- **Critério de pronto:** `questions.json` com >1.500 questões válidas e distribuição por matéria conferida contra o edital.

**Resultado:** 3.179 questões de 41 exames (o parser acabou cobrindo também os exames antigos). Distribuição de gabaritos uniforme e desvio máximo de 1,0 questão/exame vs. o edital. Detalhes e lacunas conhecidas no [README](README.md).

### Fase 1: MVP web (deploy na Vercel desde o dia 1) — CONCLUÍDA (falta deploy)
- Rotas: `/` (landing), `/praticar` (por matéria/tema, feedback imediato), `/simulado` (80 questões, timer 5h, corte 40), `/questao/[id]` (página SEO por questão).
- Domínio dikeon.com.br configurado na Vercel desde o primeiro deploy.
- Progresso em localStorage (sem auth ainda), tema claro/escuro.
- Visual seguindo o mock ZEL (paleta, cards, tipografia).

### Fase 2: Conta e inteligência de estudo
- Clerk + Neon/Drizzle: tentativas, bookmarks, runs de simulado (schema do exame-seguros serve quase 1:1).
- `/progresso` (taxa de acerto por matéria), `/diagnostico` (teste inicial que calibra o plano), fila de revisão de erradas.
- Flashcards com SRS (`/flashcards`, revisar, progresso).
- Explicações enriquecidas nas questões (rodar pipeline 4.5 em batch).

### Fase 3: ZEL completo (gamificação + IA + vade mecum)
- **Início:** sessão diária (questões de fixação + revisão inteligente + mini simulado), meta semanal, streak, XP, níveis, conquistas, ranking semanal, modo foco.
- **IA Zel** (`/ia`): chat com contexto do desempenho do usuário ("analise meus erros em Constitucional", "tenho 30 min, o que estudar?", gerar flashcards sob demanda). Claude API + tools lendo o histórico no Neon.
- **Vade Mecum** (`/vademecum`): navegação por diploma/artigo, busca, favoritos, anotações.
- **Perfil:** relatório 30 dias, marcos, plano ("prova em X dias").

### Fase 4: Expansão
- Backfill exames 04-25 (com triagem de vigência agressiva).
- Módulo 2ª fase por área.
- SEO programático: página por questão, por tema ("questões de controle de constitucionalidade OAB"), por exame, datas/edital do próximo exame (padrão que funcionou no exame-seguros).
- Avaliar mobile (React Native) só depois de tração no web.

## 6. Decisões tomadas (defaults, mudar se discordar)

1. **Marca:** Dikeon, domínio dikeon.com.br (registrar no Registro.br e apontar para a Vercel). O mockup ZEL segue como referência visual/UX; "Zel" fica como nome da tutora de IA dentro do produto.
2. **Monólito de conteúdo estático + DB só para dados de usuário**, igual ao exame-seguros. Simples, barato, rápido na Vercel.
3. **1ª fase primeiro.** 2ª fase só na Fase 4; é outro produto (discursivo) e o padrão de respostas exige UX própria.
4. **Exames recentes primeiro** (26-46). Questões antigas entram depois com flag de vigência.
5. **Explicações pré-geradas em batch** (custo previsível, latência zero), chat de IA só onde precisa ser dinâmico.
6. **Gamificação na Fase 3, não no MVP.** Streak/XP sem base de usuários é enfeite; primeiro valor real (questões + simulado).

## 7. Riscos e pontos de atenção

- **Direitos autorais:** questões FGV/OAB são documentos públicos de certame e o uso em plataformas de estudo é prática consolidada no mercado (QConcursos etc.), mas manter atribuição "FGV/Exame XX" em cada questão e não reproduzir os PDFs originais no site.
- **Vigência legislativa:** o maior risco de qualidade. A triagem LLM (4.1.4) precisa de amostragem manual por matéria antes do launch.
- **Parse de PDFs antigos:** layouts variados até ~2013; orçar LLM-parse (barato com Haiku, já validado no exame-seguros).
- **Vade Mecum desatualizado:** o PDF do Senado é 3ª ed.; para os diplomas principais, considerar puxar texto compilado do Planalto/LexML no pipeline em vez do PDF.

## 8. Próximos passos imediatos

1. ~~Validar extração ponta a ponta no exame-46~~ feito
2. ~~Escalar parse + classificação por matéria~~ feito (3.179 questões, 41 exames)
3. ~~Bootstrapping do `web/` com o visual ZEL~~ feito (`/`, `/praticar`, `/materias`, `/simulado`, `/questao/[id]`, `/progresso`)
4. **Deploy na Vercel** — depende das contas da Kethylin ([SETUP-CONTAS-KETHYLIN.md](SETUP-CONTAS-KETHYLIN.md))
5. Fase 2: auth (Clerk) + persistência do progresso no Neon (`DB_NEON` já está no `.env`)
