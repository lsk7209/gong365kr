import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

let cachedDb: LibSQLDatabase<typeof schema> | null = null;
let cachedDbKey: string | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl) {
    throw new Error("TURSO_DATABASE_URL 환경변수가 필요합니다.");
  }

  const dbKey = `${databaseUrl}:${authToken ?? ""}`;
  if (cachedDb && cachedDbKey === dbKey) {
    return cachedDb;
  }

  const client = createClient({
    url: databaseUrl,
    authToken
  });

  cachedDb = drizzle(client, { schema });
  cachedDbKey = dbKey;
  return cachedDb;
}
