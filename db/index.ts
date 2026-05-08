import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function getDb() {
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl) {
    throw new Error("TURSO_DATABASE_URL 환경변수가 필요합니다.");
  }

  const client = createClient({
    url: databaseUrl,
    authToken
  });

  return drizzle(client, { schema });
}
