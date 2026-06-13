import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

// .env.local（実値）→ .env の順に読み込み、${DB_PORT} などの参照を展開する。
expand(config({ path: ".env.local" }));
expand(config({ path: ".env" }));

const dbPort = process.env.DB_PORT ?? "5432";
const url =
  process.env.DATABASE_URL ?? `postgres://todo:todo@localhost:${dbPort}/todo`;

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
});
