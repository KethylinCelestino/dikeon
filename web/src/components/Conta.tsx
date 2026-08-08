import { SignInButton, UserButton } from "@clerk/nextjs";
import { authAtiva, usuarioAtual } from "@/lib/auth";

/**
 * Bloco de conta no cabeçalho. Enquanto o Clerk não estiver configurado ele
 * não renderiza nada: a conta é um upgrade do produto, não um requisito.
 *
 * A decisão de logado/deslogado vem do servidor (usuarioAtual) em vez dos
 * componentes de controle do Clerk, que saíram na v7.
 */
export async function Conta() {
  if (!authAtiva) return null;

  const userId = await usuarioAtual();

  if (userId) {
    return <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />;
  }

  return (
    <SignInButton mode="modal">
      <button className="focavel rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-bordo/5 hover:text-ink dark:hover:bg-white/10 dark:hover:text-cream">
        Entrar
      </button>
    </SignInButton>
  );
}

/** Convite a criar conta, exibido onde o progresso local seria perdido. */
export async function AvisoSemConta() {
  if (!authAtiva) return null;
  if (await usuarioAtual()) return null;

  return (
    <div className="card">
      <p className="font-medium">Seu progresso está só neste navegador</p>
      <p className="mt-1 text-sm text-muted">
        Com uma conta ele passa a acompanhar você no celular e no computador. O
        que você já respondeu aqui é transferido automaticamente.
      </p>
      <SignInButton mode="modal">
        <button className="btn-primary mt-4">Criar conta</button>
      </SignInButton>
    </div>
  );
}
