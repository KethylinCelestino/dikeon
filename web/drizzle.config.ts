import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// As credenciais moram no .env da raiz do projeto, fora de web/.
config({ path: "../.env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.DB_NEON!,
  },
});
