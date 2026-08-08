import type { MetadataRoute } from "next";
import { questions, materias } from "@/lib/questions";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixas = ["", "/praticar", "/materias", "/simulado"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const porMateria = materias.map((m) => ({
    url: `${SITE_URL}/materias/${m.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const porQuestao = questions.map((q) => ({
    url: `${SITE_URL}/questao/${q.id}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...fixas, ...porMateria, ...porQuestao];
}
