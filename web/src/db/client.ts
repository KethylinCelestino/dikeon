import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Cliente Neon. A conexão é opcional de propósito: enquanto as chaves não
 * estiverem no ambiente, o app segue funcionando com o progresso no
 * localStorage em vez de quebrar o build ou o site.
 */
const url = process.env.DATABASE_URL ?? process.env.DB_NEON;

export const temBanco = Boolean(url);

export const db = url ? drizzle(neon(url), { schema }) : null;

/** Usa onde o banco é obrigatório; erra cedo e com mensagem clara. */
export function exigirBanco() {
  if (!db) throw new Error("DATABASE_URL não configurada");
  return db;
}
