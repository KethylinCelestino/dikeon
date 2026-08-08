import { auth } from "@clerk/nextjs/server";

/**
 * O Clerk só entra em cena quando as duas chaves estão no ambiente. Sem elas
 * o app continua no modo sem conta (progresso no localStorage) em vez de
 * quebrar o build ou derrubar o site — a autenticação é um upgrade, não um
 * pré-requisito para o produto funcionar.
 */
export const authAtiva = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

/** Id do usuário logado, ou null se não há sessão (ou auth está desligada). */
export async function usuarioAtual(): Promise<string | null> {
  if (!authAtiva) return null;
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}
