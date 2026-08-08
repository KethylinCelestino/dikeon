import type { Metadata } from "next";
import { Runner } from "./Runner";
import { materias, filtrar, embaralhar } from "@/lib/questions";
import { mapaExplicacoes } from "@/lib/explicacoes";

export const metadata: Metadata = {
  title: "Diagnóstico: por onde começar a estudar",
  description:
    "Responda uma questão de cada matéria da 1ª fase da OAB e descubra " +
    "onde você está mais fraco antes de montar seu plano de estudo.",
};

// Sem cache: cada visita recebe um sorteio novo.
export const dynamic = "force-dynamic";

export default function Diagnostico() {
  const seed = Math.floor(Date.now() / 1000);

  // Uma questão por matéria, na ordem do edital: o objetivo é cobrir o mapa
  // inteiro rápido, não medir profundidade em nenhuma delas.
  const questoes = materias
    .map((m) => embaralhar(filtrar({ materia: m.id }), seed + m.id.length)[0])
    .filter(Boolean);

  return (
    <Runner
      questoes={questoes}
      explicacoes={mapaExplicacoes(questoes.map((q) => q.id))}
    />
  );
}
