import type { Metadata } from "next";
import { Runner } from "./Runner";
import { montarSimulado } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Simulado da OAB 1ª fase",
  description:
    "Simulado completo da 1ª fase da OAB: 80 questões reais no formato " +
    "oficial, 5 horas de prova e aprovação com 40 acertos.",
};

// Sem cache: cada visita recebe um sorteio novo de questoes.
export const dynamic = "force-dynamic";

export default function Simulado() {
  const questoes = montarSimulado(Math.floor(Date.now() / 1000));
  return <Runner questoes={questoes} />;
}
