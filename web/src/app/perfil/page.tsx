import type { Metadata } from "next";
import { Perfil } from "./Perfil";
import { AvisoSemConta } from "@/components/Conta";

export const metadata: Metadata = {
  title: "Seu perfil",
  description: "Sequência de estudo, nível, conquistas e atividade dos últimos 30 dias.",
  robots: { index: false },
};

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <Perfil />
      <AvisoSemConta />
    </div>
  );
}
