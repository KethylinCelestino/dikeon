import type { Metadata } from "next";
import { Sessao } from "./Sessao";
import { flashcards, flashcardsDaMateria } from "@/lib/flashcards";
import { getMateria } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Flashcards da OAB com repetição espaçada",
  description:
    "Revise os conceitos cobrados na 1ª fase da OAB em flashcards com " +
    "repetição espaçada: o que você erra volta logo, o que acerta espaça.",
};

interface Props {
  searchParams: Promise<{ materia?: string }>;
}

export default async function Flashcards({ searchParams }: Props) {
  const { materia } = await searchParams;

  const cartoes =
    materia && getMateria(materia) ? flashcardsDaMateria(materia) : flashcards;

  return <Sessao cartoes={cartoes} />;
}
