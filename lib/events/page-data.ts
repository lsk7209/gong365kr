import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";

const REQUIRED_DB_ENV = ["TURSO_DATABASE_URL"] as const;

export async function readEventData<T>(fallback: T, query: (db: ReturnType<typeof getDb>) => Promise<T>) {
  if (!hasRequiredEnv([...REQUIRED_DB_ENV])) {
    return fallback;
  }

  try {
    return await query(getDb());
  } catch {
    return fallback;
  }
}
