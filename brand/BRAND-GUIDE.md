# Dikeon: Brand & Design Guide

**Versão 1.0 · Agosto 2026 · dikeon.com.br**

Guia canônico de marca e design do Dikeon. Consolida a identidade herdada do mockup ZEL, corrigida e sistematizada a partir de pesquisa de melhores práticas em educação jurídica, edtech e legibilidade (fontes no final).

---

## 1. Essência da marca

**Nome.** Dikeon vem do grego *to díkaion* (τὸ δίκαιον), "aquilo que é justo", raiz da palavra Direito e do nome de Dikē, deusa grega da justiça. É a origem erudita do produto: sério o suficiente para o Direito, curto e sonoro o suficiente para uma marca de consumo.

**O que somos.** A plataforma de estudo para o Exame de Ordem: todas as questões reais da FGV, plano diário de 25 minutos, revisão inteligente e a tutora de IA Zel.

**Posicionamento em uma frase.** *Seriedade que aprova, leveza que faz você voltar amanhã.*

**A tensão central da marca.** Pesquisa de branding jurídico pede navy, serifa e sobriedade (autoridade, confiança). Pesquisa de edtech pede sessões curtas, gamificação e cores que reduzem ansiedade (Duolingo como referência dominante). O Dikeon resolve a tensão assim:

- **A base é jurídica:** navy profundo, serifa nos títulos, tom respeitoso com o conteúdo.
- **A energia é de estudo diário:** ouro para conquista e progresso, microinterações, feedback imediato, zero solenidade no tom.
- O concorrente brasileiro típico (QConcursos, Gran) parece ferramenta de banco de dados; o Dikeon deve parecer um produto desenhado, com o acabamento de um Quimbee.

**Personalidade.** Preparado, direto, encorajador, nunca pomposo. A Zel fala como uma monitora que já passou na prova: explica com fundamento legal ("art. X da Lei Y") mas em linguagem de revisão, não de doutrina.

**Tom de voz.**
- Direto e concreto: "Você acertou 7 de 10 em Constitucional" em vez de "Seu desempenho foi satisfatório".
- Encorajador sem infantilizar: comemorar streak e nível, sem excesso de emoji ou "parabéns!!!".
- Fundamentado: toda afirmação jurídica ancora em dispositivo legal com link.
- Português brasileiro, "você", frases curtas.

---

## 2. Logotipo

Arquivos em `brand/logo/`:

| Arquivo | Uso |
|---|---|
| `dikeon-icon.svg` | Símbolo: app icon, favicon, avatar, espaços quadrados |
| `dikeon-logo-horizontal.svg` | Assinatura principal sobre fundos claros |
| `dikeon-logo-horizontal-dark.svg` | Assinatura sobre navy / dark mode |
| `dikeon-icon-mono.svg` | Monocromático (carimbo, impressão, watermark) |

**Conceito.** Monograma **D** construído como traço geométrico (a coluna e o arco), com o **fiel de uma balança em perfeito equilíbrio** atravessando o contraponto: o Direito em equilíbrio dentro do D. No wordmark, o pingo do "i" é dourado: o **ponto de equilíbrio**, que o produto reutiliza como marcador de progresso, notificação e XP.

**Cores do logo.** Somente navy `#0C1F3C`, ouro `#E2B84A` e creme `#FAF6ED`. Sobre claro: tile navy + D ouro + wordmark navy. Sobre escuro: tile ouro + D navy + wordmark creme.

**Regras.**
- Área de proteção: metade da altura do símbolo em todos os lados.
- Tamanho mínimo: símbolo 16 px; assinatura horizontal 120 px de largura.
- Wordmark sempre em minúsculas: **dikeon**.
- Não rotacionar, não aplicar gradiente ou sombra, não mudar a cor do pingo do i, não usar o símbolo sem o tile sobre fundos com ruído visual.
- Nunca usar balança ilustrada, martelo de juiz ou deusa da justiça como apoio gráfico. O clichê jurídico é o que a marca evita; o equilíbrio já está abstraído no símbolo.

---

## 3. Cor

A paleta segue a norma do setor jurídico (navy dominante, 2 a 3 cores, acento quente) e adiciona a camada semântica que um produto de questões exige.

### 3.1 Paleta núcleo

| Token | Hex | Papel |
|---|---|---|
| `navy` | `#0C1F3C` | Cor da marca. Fundos escuros, texto de destaque, botão primário no claro |
| `royal` | `#1F3A5F` | Hover do navy, superfícies elevadas no dark |
| `ink` | `#17253B` | Texto padrão sobre claro |
| `muted` | `#738096` | Texto secundário, metadados |
| `line` | `#E5E9EF` | Bordas, divisores |
| `cream` | `#FAF6ED` | Fundo padrão do modo claro (papel, não branco puro) |
| `white` | `#FFFFFF` | Superfície de cards sobre cream |
| `gold` | `#E2B84A` | Acento: conquista, XP, streak, CTA no dark |
| `gold-text` | `#7E611C` | Ouro rebaixado para texto sobre fundo claro |

### 3.2 Cores semânticas (o coração do produto)

Responder questões é a interação central; acerto e erro precisam de identidade fixa e consistente em todo o app:

| Token | Hex | Fundo-tint | Uso |
|---|---|---|---|
| `success` | `#1C8C70` | `#EAF8F3` | Alternativa correta, acerto, meta batida |
| `error` | `#7A1F3D` | `#FFF0F3` | Alternativa errada. Vinho, não vermelho-alarme: errar faz parte do método |
| `warning` | `#8A5A0F` | `#FFF7DF` | Questão desatualizada/anulada, avisos de vigência |
| `info` | `#1F3A5F` | `#EDF2F8` | Dica da Zel, notas neutras |

Para texto sobre fundo claro, usar `success-text #157059`. Erro em vinho é decisão de marca: pesquisa de edtech mostra que cor reduz ou amplifica ansiedade; vermelho puro pune, vinho corrige.

### 3.3 Regras de contraste (WCAG AA)

- Texto corrido: mínimo 4.5:1. `ink` sobre `cream` e `cream` sobre `navy` passam com folga.
- **Ouro `#E2B84A` nunca é cor de texto sobre fundo claro** (contraste ~2:1, reprova). Sobre claro, ouro só em preenchimentos, badges e ícones, com texto em `navy`; para texto dourado, usar `gold-text`.
- Ouro sobre navy passa AA e é a combinação de destaque da marca.
- `muted` só para texto ≥14 px; nunca para informação essencial.

### 3.4 Dark mode

Dark mode é primário (estudo à noite é o caso de uso real), não um tema derivado:

- Fundo `navy #0C1F3C`, superfícies `white/5` com borda `white/10`, texto `cream`.
- Botão primário vira **ouro com texto navy** (já implementado no app).
- Tints semânticos viram a cor a 12-15% de opacidade sobre o navy, com o texto na versão clara da cor (`#4ECBA5` para success, `#E58BA6` para error).

---

## 4. Tipografia

**Par tipográfico: Lora (display) + Inter (UI e leitura).**

- **Lora** (Google Fonts, variable): títulos, números de destaque, wordmark de apoio. Serifa contemporânea com DNA de livro jurídico; substitui a Georgia atual, que é fallback de sistema sem personalidade própria. Georgia permanece como fallback na stack.
- **Inter** (já em uso): todo o resto. UI, corpo de questão, botões, tabelas. Usar `font-feature-settings: "tnum"` em placares, timers e rankings.

### Escala

| Papel | Fonte | Tamanho/altura | Uso |
|---|---|---|---|
| Display | Lora 600 | 40/48 | Hero da landing |
| H1 | Lora 600 | 30/38 | Título de página |
| H2 | Lora 600 | 22/30 | Seções |
| H3 | Inter 600 | 17/26 | Cards, subtítulos |
| **Corpo-questão** | Inter 400 | **17/28** | Enunciados e alternativas |
| Corpo | Inter 400 | 15/24 | UI geral |
| Small | Inter 500 | 13/20 | Metadados, labels |
| Eyebrow | Inter 600 | 11/16, caps, tracking 0.14em | Já em uso, manter |

### Regras de leitura (o produto é leitura longa)

Enunciado de questão da FGV é texto denso; as regras de legibilidade são requisito de produto, não estética:

- Corpo de questão a **17 px mínimo**, entrelinha **1.6 ou mais**.
- Medida de coluna: **`max-w-[68ch]`** para enunciados (faixa ideal de 50 a 75 caracteres por linha; WCAG teto de 80).
- Nunca justificar texto; sempre alinhado à esquerda.
- Referências legais ("art. 5º, LXVII, CF/88") em `gold-text` no claro e `gold` no escuro, sublinhado pontilhado, linkando ao Vade Mecum.

---

## 5. Layout e componentes

- **Grid de espaçamento 4 pt.** Padding padrão de card: 20 px (`p-5`, atual, manter).
- **Raio:** cards `rounded-2xl` (16 px), botões e inputs `rounded-xl` (12 px), badges `rounded-full`. O tile do logo usa a mesma linguagem (raio ~22%).
- **Sombra:** apenas a `shadow-card` atual sobre claro; no dark, sem sombra, elevação por borda e opacidade (já implementado).
- **Superfícies:** cream de fundo + cards brancos. Nunca branco puro como fundo de página; nunca cinza neutro (o calor do creme é assinatura da marca).
- **Botões:** primário navy→cream (claro) e gold→navy (escuro); ghost com borda `line`. Um único CTA primário por tela.
- **Ícones:** traço 1.5-2 px, cantos arredondados (Lucide serve como base), nunca preenchimento sólido exceto estados ativos.
- **Densidade:** uma decisão por tela. A tela de questão mostra: enunciado, alternativas, um CTA. Progresso, XP e navegação ficam na moldura, nunca competindo com a leitura.

---

## 6. Gamificação: regras visuais

Gamificação entra na Fase 3, mas as regras visuais ficam definidas desde já:

- **Ouro = conquista.** XP, streak, nível, medalha e ranking são o monopólio do ouro. Se tudo for dourado, nada é conquista: ouro nunca aparece em navegação, bordas decorativas ou fundos de seção.
- **Streak e sessão diária** seguem o modelo validado (Duolingo): meta pequena e alcançável, aro de progresso circular, celebração breve (300-400 ms, ease-out) ao completar.
- **Microinterações:** feedback de acerto/erro em <100 ms; transição de cor + ícone (check/x), sem animação que atrase a próxima questão. Respeitar `prefers-reduced-motion`.
- **Ranking e comparação social** sempre opcionais e nunca na tela de estudo (ansiedade reduz retenção; o foco da tela de questão é sagrado).
- **Modo foco:** remove a moldura gamificada inteira. Um toggle, já previsto no mockup ZEL.

---

## 7. Acessibilidade (resumo executável)

- Contraste AA em todos os pares de texto (seção 3.3).
- Fonte base 16 px+; zoom a 200% sem quebra de layout.
- Alvos de toque ≥44 px (alternativas de questão são botões grandes, não radio buttons pequenos).
- Estado de foco visível (anel `royal` no claro, `gold` no escuro).
- Acerto/erro nunca comunicado só por cor: sempre cor + ícone + texto.
- `prefers-reduced-motion` respeitado em toda animação.

---

## 8. Aplicação no app atual

Diff sugerido para `web/tailwind.config.ts` (mantém tokens atuais, adiciona a camada que falta):

```ts
colors: {
  navy: "#0c1f3c",
  royal: "#1f3a5f",
  gold: "#e2b84a",
  "gold-text": "#7e611c",
  cream: "#faf6ed",
  ink: "#17253b",
  muted: "#738096",
  line: "#e5e9ef",
  wine: "#7a1f3d",      // manter como alias de error
  green: "#1c8c70",     // manter como alias de success
  success: { DEFAULT: "#1c8c70", text: "#157059", tint: "#eaf8f3" },
  error:   { DEFAULT: "#7a1f3d", tint: "#fff0f3" },
  warning: { DEFAULT: "#8a5a0f", tint: "#fff7df" },
  info:    { DEFAULT: "#1f3a5f", tint: "#edf2f8" },
},
fontFamily: {
  sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
  serif: ["Lora", "Georgia", "ui-serif", "serif"],  // carregar Lora via next/font
},
```

Backlog de aplicação:
1. Carregar Lora via `next/font/google` e aplicar em h1/h2 e números de destaque.
2. Trocar cores hard-coded de acerto/erro pelos tokens semânticos em `QuestionCard` e nos Runners.
3. Aplicar `max-w-[68ch]` e `text-[17px] leading-[1.65]` no enunciado.
4. Usar `dikeon-icon.svg` como favicon/app icon e a assinatura horizontal no header.
5. Badge de "questão desatualizada" com o par warning definido acima.

---

## 9. Fontes da pesquisa

- Branding jurídico 2026 (navy dominante, 2-3 cores, serif = tradição, tipografia grande e sóbria): [Rankings.io](https://rankings.io/blog/law-firm-logos/), [OnTheMap](https://www.onthemap.com/blog/law-firm-logos/), [PaperStreet](https://www.paperstreet.com/blog/2026-law-firm-website-design-trends/), [Grow Law](https://growlaw.co/blog/best-law-firm-logo-designs)
- Web design para legal tech e faculdades de direito (clareza, rotas por audiência, ícones para conceitos complexos): [Insivia](https://www.insivia.com/best-practices-for-legal-tech-website-design/), [OHO](https://www.oho.com/blog/law-school-website-examples), [KrishaWeb](https://www.krishaweb.com/blog/best-legal-website-design-examples/)
- Edtech e gamificação (Duolingo como referência, sessões curtas, cor e microinteração contra ansiedade, continuidade entre dispositivos): [Merge](https://merge.rocks/blog/7-best-designed-edtech-platforms-weve-seen-so-far), [Lollypop](https://lollypop.design/blog/2025/august/top-education-app-design-trends-2025/), [NetBramha](https://netbramha.com/blogs/gamification-in-edtech-ux-design/), [PolyChat](https://www.polychatapp.com/blog/gamification-examples-in-education)
- Bar prep de referência em UX (Quimbee: practice-first, interface limpa; Themis: inovação): [Quimbee](https://www.quimbee.com/bar-review/compare), [Test Prep Insight](https://testprepinsight.com/comparisons/quimbee-vs-barbri/)
- Legibilidade e acessibilidade (50-75 cpl, corpo 16px+, entrelinha 1.5+, WCAG): [Baymard](https://baymard.com/blog/line-length-readability), [UXPin](https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/), [WebAIM](https://webaim.org/techniques/fonts/), [Section508.gov](https://www.section508.gov/develop/fonts-typography/), [USWDS](https://designsystem.digital.gov/components/typography/)
