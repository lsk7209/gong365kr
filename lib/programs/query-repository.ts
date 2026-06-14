import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  ne,
  not,
  or,
  sql,
} from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { getDb } from "@/db";
import { programs } from "@/db/schema";
import { findRegionsForProgram, type RegionRow } from "@/lib/regions";
import { PROGRAM_CATEGORY_LABELS, type ProgramListItem } from "./display";

type DbClient = ReturnType<typeof getDb>;

export type ProgramCategoryCount = {
  label: string;
  count: number;
};

export type RegionCount = {
  code: string;
  count: number;
};

export type ProgramFilterInput = {
  keyword?: string;
  categoryCode?: string;
  region?: RegionRow;
};

export async function listActivePrograms(
  db: DbClient,
  limit: number,
  filters: ProgramFilterInput = {},
): Promise<ProgramListItem[]> {
  return listOpenPrograms(db, limit, filters);
}

export async function listOpenPrograms(
  db: DbClient,
  limit: number,
  filters: ProgramFilterInput = {},
  now = new Date(),
): Promise<ProgramListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        programFilterCondition(filters),
        not(isProgramClosedCondition(nowSeconds)),
      ),
    )
    .orderBy(
      programClosedSort(),
      asc(programs.applicationEnd),
      desc(programs.lastSyncedAt),
    )
    .limit(limit);
}

export async function listClosedPrograms(
  db: DbClient,
  limit: number,
  filters: ProgramFilterInput = {},
  now = new Date(),
): Promise<ProgramListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        programFilterCondition(filters),
        isProgramClosedCondition(nowSeconds),
      ),
    )
    .orderBy(asc(programs.applicationEnd), desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function listOpenProgramsByDeadlineMonth(
  db: DbClient,
  year: number,
  month: number,
  limit: number,
  now = new Date(),
): Promise<ProgramListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        gte(programs.applicationEnd, start),
        lt(programs.applicationEnd, end),
        not(isProgramClosedCondition(nowSeconds)),
      ),
    )
    .orderBy(asc(programs.applicationEnd), desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function listClosedProgramsByDeadlineMonth(
  db: DbClient,
  year: number,
  month: number,
  limit: number,
  now = new Date(),
): Promise<ProgramListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        gte(programs.applicationEnd, start),
        lt(programs.applicationEnd, end),
        isProgramClosedCondition(nowSeconds),
      ),
    )
    .orderBy(asc(programs.applicationEnd), desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function listOpenProgramsByRegion(
  db: DbClient,
  region: RegionRow,
  limit: number,
  now = new Date(),
): Promise<ProgramListItem[]> {
  return listOpenPrograms(db, limit, { region }, now);
}

export async function listClosedProgramsByRegion(
  db: DbClient,
  region: RegionRow,
  limit: number,
  now = new Date(),
): Promise<ProgramListItem[]> {
  return listClosedPrograms(db, limit, { region }, now);
}

export async function listRecentProgramsForFeed(
  db: DbClient,
  limit: number,
  now = new Date(),
): Promise<ProgramListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(validProgramCondition(), not(isProgramClosedCondition(nowSeconds))),
    )
    .orderBy(desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function getProgramBySlug(
  db: DbClient,
  slug: string,
): Promise<ProgramListItem | null> {
  const [program] = await db
    .select(programListFields)
    .from(programs)
    .where(and(validProgramCondition(), eq(programs.slug, slug)))
    .limit(1);

  return program ?? null;
}

export async function listRelatedPrograms(
  db: DbClient,
  program: ProgramListItem,
  limit: number,
): Promise<ProgramListItem[]> {
  const relatedConditions = [
    program.categoryCode
      ? eq(programs.categoryCode, program.categoryCode)
      : undefined,
    program.agency ? eq(programs.agency, program.agency) : undefined,
    program.executor ? eq(programs.executor, program.executor) : undefined,
  ].filter(Boolean);

  const regionConditions = findRegionsForProgram(program).map((region) =>
    regionKeywordCondition(region.keywords),
  );

  if (relatedConditions.length === 0 && regionConditions.length === 0) {
    return [];
  }

  if (regionConditions.length > 0) {
    relatedConditions.push(or(...regionConditions));
  }

  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        ne(programs.id, program.id),
        or(...relatedConditions),
      ),
    )
    .orderBy(
      programClosedSort(),
      asc(programs.applicationEnd),
      desc(programs.lastSyncedAt),
    )
    .limit(limit);
}

export async function listActiveRelatedPrograms(
  db: DbClient,
  program: ProgramListItem,
  limit: number,
  now = new Date(),
): Promise<ProgramListItem[]> {
  const relatedConditions = [
    program.categoryCode
      ? eq(programs.categoryCode, program.categoryCode)
      : undefined,
    program.agency ? eq(programs.agency, program.agency) : undefined,
    program.executor ? eq(programs.executor, program.executor) : undefined,
  ].filter(Boolean);
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const regionConditions = findRegionsForProgram(program).map((region) =>
    regionKeywordCondition(region.keywords),
  );

  if (relatedConditions.length === 0 && regionConditions.length === 0) {
    return [];
  }

  if (regionConditions.length > 0) {
    relatedConditions.push(or(...regionConditions));
  }

  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        ne(programs.id, program.id),
        or(...relatedConditions),
        not(isProgramClosedCondition(nowSeconds)),
      ),
    )
    .orderBy(asc(programs.applicationEnd), desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function listProgramSlugsForSitemap(db: DbClient, limit: number) {
  return db
    .select({
      slug: programs.slug,
      lastModified: programs.lastSyncedAt,
    })
    .from(programs)
    .where(validProgramCondition())
    .orderBy(desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function countActiveProgramsByCategory(
  db: DbClient,
  limit: number,
  now = new Date(),
): Promise<ProgramCategoryCount[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const activeCount = count();
  const rows = await db
    .select({
      label: programs.categoryCode,
      count: activeCount,
    })
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        isNotNull(programs.categoryCode),
        not(isProgramClosedCondition(nowSeconds)),
      ),
    )
    .groupBy(programs.categoryCode)
    .orderBy(desc(activeCount))
    .limit(limit);

  return rows.map((row) => ({
    label: row.label ?? "지원사업",
    count: row.count,
  }));
}

export async function countProgramsByRegions(
  db: DbClient,
  regions: readonly RegionRow[],
  now = new Date(),
): Promise<RegionCount[]> {
  return Promise.all(
    regions.map((region) => countProgramsByRegion(db, region, now)),
  );
}

async function countProgramsByRegion(
  db: DbClient,
  region: RegionRow,
  now = new Date(),
): Promise<RegionCount> {
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const [result] = await db
    .select({ count: count() })
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        regionKeywordCondition(region.keywords),
        not(isProgramClosedCondition(nowSeconds)),
      ),
    );

  return {
    code: region.code,
    count: result?.count ?? 0,
  };
}

const programListFields = {
  id: programs.id,
  slug: programs.slug,
  title: programs.title,
  summaryShort: programs.summaryShort,
  agency: programs.agency,
  executor: programs.executor,
  categoryCode: programs.categoryCode,
  applicationStart: programs.applicationStart,
  applicationEnd: programs.applicationEnd,
  status: programs.status,
  rawUrl: programs.rawUrl,
};

function regionKeywordCondition(keywords: readonly string[]) {
  const clauses = keywords.flatMap((keyword) => {
    const pattern = `%${keyword}%`;

    return [
      like(programs.title, pattern),
      like(programs.summaryShort, pattern),
      like(programs.agency, pattern),
      like(programs.executor, pattern),
    ];
  });

  return or(...clauses) ?? sql`1 = 0`;
}

function validProgramCondition() {
  return or(
    isNull(programs.categoryCode),
    inArray(programs.categoryCode, PROGRAM_CATEGORY_LABELS),
  );
}

function programFilterCondition(filters: ProgramFilterInput) {
  const conditions = [
    filters.categoryCode
      ? eq(programs.categoryCode, filters.categoryCode)
      : undefined,
    filters.region
      ? regionKeywordCondition(filters.region.keywords)
      : undefined,
    filters.keyword ? programKeywordCondition(filters.keyword) : undefined,
  ].filter(Boolean);

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function programKeywordCondition(keyword: string) {
  const pattern = `%${keyword}%`;

  return or(
    like(programs.title, pattern),
    like(programs.summaryShort, pattern),
    like(programs.agency, pattern),
    like(programs.executor, pattern),
    like(programs.categoryCode, pattern),
  );
}

function isProgramClosedCondition(nowSeconds: number) {
  return sql`(${programs.status} = 'closed' OR (${programs.applicationEnd} IS NOT NULL AND ${programs.applicationEnd} + 86399 < ${nowSeconds}))`;
}

function programClosedSort() {
  const nowSeconds = Math.floor(Date.now() / 1000);

  return sql`case
    when ${programs.status} = 'closed' then 1
    when ${programs.applicationEnd} is not null and (${programs.applicationEnd} + 86399) < ${nowSeconds} then 1
    else 0
  end`;
}

// Turso rows_read 절감: 지역/카테고리 facet 카운트는 LIKE 풀스캔 + 지역 수만큼
// fan-out 되어 가장 비싼 쿼리다. sync 주기(6시간)와 맞춰 공유 캐싱하면
// 봇이 수천 페이지를 cold 크롤해도 facet 계산은 6시간당 1회로 줄어든다.
const FACET_CACHE_REVALIDATE_SECONDS = 21600; // 6시간 = cron sync 주기

// 긴급 출혈 차단: regionKeywordCondition(LIKE 4컬럼×지역키워드) 기반 count(*)가
// 봇 크롤로 813,000회 실행되어 rows_read 197M(전체의 41%)을 소비했다.
// unstable_cache가 기대만큼 안 먹어 facet 계산을 전면 비활성(빈 값 반환, DB 미접근).
// UI의 지역/카테고리 건수만 빠지며 색인/콘텐츠는 정상. 정규화(programs_regions
// 조인)·인덱스로 경량화 후 복원 예정.
export const getCachedRegionCounts = unstable_cache(
  async (): Promise<RegionCount[]> => {
    return [];
  },
  ["program-region-counts-disabled"],
  { revalidate: FACET_CACHE_REVALIDATE_SECONDS, tags: ["programs"] },
);

export const getCachedCategoryCounts = unstable_cache(
  async (_limit: number): Promise<ProgramCategoryCount[]> => {
    return [];
  },
  ["program-category-counts-disabled"],
  { revalidate: FACET_CACHE_REVALIDATE_SECONDS, tags: ["programs"] },
);
