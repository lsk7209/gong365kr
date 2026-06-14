/**
 * facet_counts 테이블만 운영 Turso DB에 생성 (CREATE TABLE IF NOT EXISTS, idempotent).
 * 운영 DB가 db:push로 만들어져 마이그레이션 추적이 없어 drizzle-kit migrate가
 * 충돌하므로, 신규 테이블만 직접 적용한다.
 * 실행: TURSO_DATABASE_URL=.. TURSO_AUTH_TOKEN=.. node scripts/apply-facet-table.mjs
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN 환경변수가 필요합니다.");
  process.exit(1);
}

const db = createClient({ url, authToken });

await db.execute(`CREATE TABLE IF NOT EXISTS facet_counts (
  facet_type text NOT NULL,
  facet_key text NOT NULL,
  label text,
  count integer NOT NULL,
  updated_at integer NOT NULL,
  PRIMARY KEY(facet_type, facet_key)
)`);

console.log("facet_counts 테이블 적용 완료");
