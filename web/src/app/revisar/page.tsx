import type { Metadata } from "next";
import { Revisao } from "./Revisao";

export const metadata: Metadata = {
  title: "Revisar meus erros",
  description:
    "Refaça as questões da OAB que você errou, com o comentário e o " +
    "fundamento legal de cada uma.",
  robots: { index: false },
};

export default function Revisar() {
  return <Revisao />;
}
