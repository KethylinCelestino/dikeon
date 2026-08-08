import type { Metadata } from "next";
import { Painel } from "./Painel";
import { contarPorMateria } from "@/lib/questions";
import { AvisoSemConta } from "@/components/Conta";

export const metadata: Metadata = {
  title: "Seu progresso",
  description: "Acompanhe sua taxa de acertos por matéria na preparação para a OAB.",
  robots: { index: false },
};

export default function Progresso() {
  return (
    <div className="space-y-6">
      <Painel totalPorMateria={contarPorMateria()} />
      <AvisoSemConta />
    </div>
  );
}
