/**
 * facet_counts만 독립 갱신 — 기존 programs 데이터 기반이라 Bizinfo fetch와 무관.
 * sync-bizinfo가 외부 API 실패로 중단돼도 facet은 이 스크립트로 갱신 가능.
 * 실행: TURSO_DATABASE_URL=.. TURSO_AUTH_TOKEN=.. pnpm tsx scripts/refresh-facets.ts
 */
import { getDb } from "@/db";
import { refreshFacetCounts } from "@/lib/programs/repository";

const result = await refreshFacetCounts(getDb());
process.stdout.write(`facet 갱신 완료: ${JSON.stringify(result)}\n`);
