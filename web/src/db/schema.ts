import {
  pgTable,
  text,
  char,
  boolean,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

/**
 * Uma linha por resposta dada, não por questão: o histórico de tentativas é o
 * que permite dizer "você errou isto duas vezes e acertou na terceira".
 */
export const tentativas = pgTable(
  "tentativas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    questaoId: text("questao_id").notNull(),
    escolhida: char("escolhida", { length: 1 }).notNull(),
    acertou: boolean("acertou").notNull(),
    // Desnormalizado de propósito: evita ter que carregar o banco de questões
    // no servidor só para agrupar desempenho por matéria.
    materia: text("materia"),
    em: timestamp("em", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("tentativas_user_idx").on(t.userId, t.em),
    index("tentativas_user_questao_idx").on(t.userId, t.questaoId),
    index("tentativas_user_materia_idx").on(t.userId, t.materia),
  ],
);

export type Tentativa = typeof tentativas.$inferSelect;
export type NovaTentativa = typeof tentativas.$inferInsert;
