import { and, asc, count, desc, gte, isNotNull, like, lt, or, sql } from "drizzle-orm";
import type { getDb } from "@/db";
import { programs } from "@/db/schema";
import type { RegionRow } from "@/lib/regions";
import type { ProgramListItem } from "./display";

type DbClient = ReturnType<typeof getDb>;

export type ProgramCategoryCount = {
  label: string;
  count: number;
};

export type RegionCount = {
  code: string;
  count: number;
};

export async function listClosingPrograms(db: DbClient, limit: number, now = new Date()): Promise<ProgramListItem[]> {
  return db
    .select(programListFields)
    .from(programs)
    .where(and(gte(programs.applicationEnd, now), sql`${programs.status} <> 'closed'`))
    .orderBy(asc(programs.applicationEnd))
    .limit(limit);
}

export async function listProgramsByDeadlineMonth(
  db: DbClient,
  year: number,
  month: number,
  limit: number
): Promise<ProgramListItem[]> {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return db
    .select(programListFields)
    .from(programs)
    .where(and(gte(programs.applicationEnd, start), lt(programs.applicationEnd, end)))
    .orderBy(asc(programs.applicationEnd))
    .limit(limit);
}

export async function listProgramsByRegion(
  db: DbClient,
  region: RegionRow,
  limit: number
): Promise<ProgramListItem[]> {
  return db
    .select(programListFields)
    .from(programs)
    .where(and(regionKeywordCondition(region.keywords), sql`${programs.status} <> 'closed'`))
    .orderBy(asc(programs.applicationEnd), desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function listRecentProgramsForFeed(db: DbClient, limit: number): Promise<ProgramListItem[]> {
  return db
    .select(programListFields)
    .from(programs)
    .where(sql`${programs.status} <> 'closed'`)
    .orderBy(desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function countActiveProgramsByCategory(db: DbClient, limit: number): Promise<ProgramCategoryCount[]> {
  const activeCount = count();
  const rows = await db
    .select({
      label: programs.categoryCode,
      count: activeCount
    })
    .from(programs)
    .where(and(sql`${programs.status} <> 'closed'`, isNotNull(programs.categoryCode)))
    .groupBy(programs.categoryCode)
    .orderBy(desc(activeCount))
    .limit(limit);

  return rows.map((row) => ({
    label: row.label ?? "지원사업",
    count: row.count
  }));
}

export async function countProgramsByRegions(db: DbClient, regions: readonly RegionRow[]): Promise<RegionCount[]> {
  return Promise.all(regions.map((region) => countProgramsByRegion(db, region)));
}

async function countProgramsByRegion(db: DbClient, region: RegionRow): Promise<RegionCount> {
  const [result] = await db
    .select({ count: count() })
    .from(programs)
    .where(and(regionKeywordCondition(region.keywords), sql`${programs.status} <> 'closed'`));

  return {
    code: region.code,
    count: result?.count ?? 0
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
  rawUrl: programs.rawUrl
};

function regionKeywordCondition(keywords: readonly string[]) {
  const clauses = keywords.flatMap((keyword) => {
    const pattern = `%${keyword}%`;

    return [
      like(programs.title, pattern),
      like(programs.summaryShort, pattern),
      like(programs.agency, pattern),
      like(programs.executor, pattern)
    ];
  });

  return or(...clauses) ?? sql`1 = 0`;
}
