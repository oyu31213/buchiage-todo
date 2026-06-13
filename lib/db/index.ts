import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Next.js は .env.local を自動で読み込み、${DB_PORT} を展開する。
const dbPort = process.env.DB_PORT ?? "5432";
const connectionString =
  process.env.DATABASE_URL ?? `postgres://todo:todo@localhost:${dbPort}/todo`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
