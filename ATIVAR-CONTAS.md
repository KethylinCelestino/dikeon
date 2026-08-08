# Ativar contas de usuário no Dikeon

Toda a camada de autenticação e persistência já está construída e no ar, mas
**desligada**. Sem as chaves no ambiente, o app roda como hoje: o progresso
fica no navegador de quem estuda. Assim que as três variáveis abaixo existirem
na Vercel, a conta liga sozinha — não há código a escrever.

## As três variáveis

Na Vercel: projeto `dikeon` → **Settings → Environment Variables**. Adicione as
três em **Production, Preview e Development** e faça um **Redeploy** (mudar
variável não redeploya sozinho).

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → aplicação `Dikeon` → **API Keys** |
| `CLERK_SECRET_KEY` | mesma tela do Clerk |
| `DATABASE_URL` | Neon → projeto `dikeon` → **Connection string** (a mesma que está no `.env` local como `DB_NEON`) |

A chave secreta do Clerk e a string do banco não podem aparecer em código,
print ou mensagem — só nesse painel.

## No painel do Clerk, antes de ligar

1. **User & Authentication → Email, Phone, Username**: deixe ativo o login por
   **e-mail** e, se quiser, **Google**. Desative o que não for usar.
2. **Customization → Localization**: o app já pede português (`ptBR`) pelo
   código; não precisa mexer.
3. Quando o `dikeon.com.br` estiver apontado, em **Domains** troque o domínio
   de desenvolvimento pelo definitivo.

## O que acontece quando ligar

- Aparece o botão **Entrar** no cabeçalho e o convite para criar conta na tela
  de progresso.
- Quem já estudou sem conta **não perde nada**: no primeiro acesso logado, o
  histórico do navegador sobe inteiro para o banco de uma vez.
- Com conta, o servidor passa a ser a fonte da verdade e o progresso acompanha
  a pessoa entre celular e computador. O navegador continua guardando uma cópia
  local, então a resposta aparece na hora e nada se perde se a rede cair.
- Sem conta, tudo continua funcionando como hoje.

## Como conferir se ligou

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dikeon.com.br/api/tentativas
```

`401` significa "sem sessão" e é o esperado tanto no modo desligado quanto para
quem não está logado. O sinal de que ligou é o botão **Entrar** aparecer no
cabeçalho do site.

## Banco

A tabela `tentativas` já existe no Neon, com índices por usuário, por questão e
por matéria. Para recriar em outro banco:

```bash
cd web && pnpm exec drizzle-kit push
```

O schema está em `web/src/db/schema.ts` e lê as credenciais do `.env` da raiz.
