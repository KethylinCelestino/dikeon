# Dikeon: Guia de criação de contas (Kethylin)

Você vai ser a dona das contas onde o Dikeon roda. São 6 contas, todas simples de criar. Siga a ordem abaixo. Tempo total: ~1h.

**Antes de começar:**
- Use um único e-mail para tudo (ideal: um e-mail dedicado tipo `kethylin@dikeon.com.br` depois que o domínio existir; para começar, seu Gmail pessoal serve).
- Guarde as senhas num gerenciador (1Password, Bitwarden ou o do próprio navegador).
- Ative autenticação em 2 fatores (2FA) em TODAS as contas. É o passo mais importante deste guia.
- Nunca mande senha ou chave de API por WhatsApp/e-mail. Se precisar compartilhar acesso, use o mecanismo de convite de cada plataforma.

---

## 1. GitHub (código do projeto)

1. Acesse https://github.com/signup e crie a conta (username sugerido: `kethylin` ou similar).
2. Ative 2FA: Settings → Password and authentication → Two-factor authentication.
3. Crie o repositório: botão "New repository" → nome `dikeon` → **Private** → Create.
4. Convide o Andries como colaborador: no repositório, Settings → Collaborators → Add people → usuário do Andries.

Custo: grátis.

## 2. Registro.br (domínio dikeon.com.br)

1. Acesse https://registro.br e clique em "Crie sua conta". Vai pedir CPF, endereço e e-mail.
2. Confirme o e-mail e ative a verificação em duas etapas (Painel → Segurança).
3. Busque `dikeon.com.br` e registre (1 ano; dá para ativar renovação automática).
4. Pagamento via Pix ou boleto. O domínio ativa em alguns minutos após o pagamento.
5. **Não configure DNS ainda.** Isso é feito no passo 3 (Vercel), quando o projeto existir. A configuração será: Painel Registro.br → seu domínio → Alterar servidores DNS → usar os servidores que a Vercel indicar (`ns1.vercel-dns.com` e `ns2.vercel-dns.com`).

Custo: R$ 40/ano.

## 3. Vercel (hospedagem do site)

1. Acesse https://vercel.com/signup e escolha **"Continue with GitHub"** (usa a conta do passo 1; assim a Vercel já enxerga o repositório e faz deploy automático a cada atualização do código).
2. Plano: comece no **Hobby (grátis)**. Quando o site tiver uso real/comercial, migra para o Pro (US$ 20/mês); a Vercel avisa quando for a hora.
3. Depois que o Andries subir o código: New Project → importar o repositório `dikeon` → Deploy.
4. Conectar o domínio: no projeto → Settings → Domains → adicionar `dikeon.com.br`. A Vercel mostra os servidores DNS; configure-os no Registro.br (passo 2.5). Propaga em até 24h, normalmente em minutos.

Custo: grátis no início; US$ 20/mês quando escalar.

## 4. Clerk (login dos usuários)

1. Acesse https://clerk.com e crie a conta com "Continue with GitHub".
2. Create application → nome `Dikeon` → habilite login por **e-mail** e **Google**.
3. Não precisa configurar mais nada; o Andries pega as chaves (Publishable key e Secret key) no dashboard e coloca na Vercel.

Custo: grátis até 10.000 usuários ativos/mês.

## 5. Neon (banco de dados)

1. Acesse https://neon.tech e crie a conta com "Continue with GitHub".
2. Create project → nome `dikeon` → região `AWS São Paulo (sa-east-1)`.
3. Pronto. O Andries pega a connection string no dashboard.

Custo: grátis no plano inicial (suficiente por bastante tempo).

## 6. Anthropic (IA da Zel)

1. Acesse https://console.anthropic.com e crie a conta.
2. Ative 2FA nas configurações.
3. Billing → adicionar cartão e colocar um crédito inicial (US$ 20 basta para começar) e um **limite de gasto mensal** (ex.: US$ 50) para não ter surpresa.
4. O Andries cria a chave de API (API Keys) e coloca na Vercel. A chave nunca vai para o código nem para conversas.

Custo: por uso; com limite configurado, previsível.

---

## Depois de criar tudo

Me avise (Andries) quando os passos 1 a 6 estiverem prontos, informando:
1. Seu username do GitHub (para eu confirmar o convite do repositório).
2. Confirmação de que o domínio está pago e ativo no Registro.br.
3. Nas contas Vercel, Clerk, Neon e Anthropic: me adicione como membro do time/projeto pelo convite de cada dashboard (opção "Invite member" ou "Invite teammate"), usando meu e-mail.

Com isso eu configuro o resto (deploy, chaves, banco, domínio) sem precisar da sua senha de nada.

## Resumo de custos

| Conta | Custo agora | Custo futuro |
|---|---|---|
| GitHub | grátis | grátis |
| Registro.br | R$ 40/ano | R$ 40/ano |
| Vercel | grátis | US$ 20/mês (uso comercial) |
| Clerk | grátis | pago acima de 10k usuários/mês |
| Neon | grátis | ~US$ 19/mês se crescer muito |
| Anthropic | ~US$ 20 crédito | por uso, com teto definido |

Total para lançar: **R$ 40 + ~US$ 20**.
