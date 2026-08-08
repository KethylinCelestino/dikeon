import Link from "next/link";
import type { Metadata } from "next";
import { Chat } from "./Chat";

export const metadata: Metadata = {
  title: "Zel, sua monitora de estudos",
  description:
    "Tire dúvidas de Direito e monte seu plano de estudo para a OAB com a " +
    "Zel, que enxerga seu desempenho por matéria.",
};

export default function ZelPage() {
  // A IA é um upgrade, não um requisito: sem a chave, a tela explica em vez
  // de quebrar, no mesmo padrão do Clerk.
  if (!process.env.ANTHROPIC_API_KEY) {
    return (
      <div className="card max-w-leitura">
        <h1 className="font-serif text-2xl font-semibold">Zel indisponível</h1>
        <p className="mt-2 text-muted">
          A tutora precisa de uma chave da API da Anthropic configurada no
          ambiente. Enquanto isso, o resto do app funciona normalmente.
        </p>
        <Link href="/praticar" className="btn-primary mt-6">
          Praticar questões
        </Link>
      </div>
    );
  }
  return <Chat />;
}
