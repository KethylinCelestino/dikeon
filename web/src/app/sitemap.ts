import type { MetadataRoute } from "next";
import { questions, materias, exames, temasComQuestoes } from "@/lib/questions";
import { listaDiplomas } from "@/lib/vademecum";
import { slugificar } from "@/lib/slug";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => `${SITE_URL}${p}`;

  // Páginas de entrada, com a prioridade mais alta.
  const fixas: MetadataRoute.Sitemap = [
    { url: url(""), changeFrequency: "weekly", priority: 1 },
    { url: url("/praticar"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/simulado"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/exames"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/materias"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/flashcards"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/vademecum"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/diagnostico"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/zel"), changeFrequency: "monthly", priority: 0.6 },
  ];

  const porMateria: MetadataRoute.Sitemap = materias.map((m) => ({
    url: url(`/materias/${m.id}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Temas são a cauda longa: prioridade acima das questões individuais.
  const porTema: MetadataRoute.Sitemap = temasComQuestoes().map((t) => ({
    url: url(`/materias/${t.materia}/${slugificar(t.tema)}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const porExame: MetadataRoute.Sitemap = exames().map((e) => ({
    url: url(`/exames/${e}`),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const porDiploma: MetadataRoute.Sitemap = listaDiplomas.map((d) => ({
    url: url(`/vademecum/${d.slug}`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const porQuestao: MetadataRoute.Sitemap = questions.map((q) => ({
    url: url(`/questao/${q.id}`),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [
    ...fixas,
    ...porMateria,
    ...porTema,
    ...porExame,
    ...porDiploma,
    ...porQuestao,
  ];
}
