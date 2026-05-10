import { and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, like, lt, ne, or, sql } from "drizzle-orm";
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

export async function listClosingPrograms(db: DbClient, limit: number, now = new Date()): Promise<ProgramListItem[]> {
  return db
    .select(programListFields)
    .from(programs)
    .where(
      and(
        validProgramCondition(),
        sql`${programs.applicationEnd} is not null and (${programs.applicationEnd} + 86399) >= ${Math.floor(now.getTime() / 1000)}`,
        sql`${programs.status} <> 'closed'`
      )
    )
    .orderBy(asc(programs.applicationEnd))
    .limit(limit);
}

export async function listActivePrograms(
  db: DbClient,
  limit: number,
  filters: ProgramFilterInput = {}
): Promise<ProgramListItem[]> {
  return db
    .select(programListFields)
    .from(programs)
    .where(and(validProgramCondition(), programFilterCondition(filters)))
    .orderBy(programClosedSort(), asc(programs.applicationEnd), desc(programs.lastSyncedAt))
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
    .where(and(validProgramCondition(), gte(programs.applicationEnd, start), lt(programs.applicationEnd, end)))
    .orderBy(programClosedSort(), asc(programs.applicationEnd))
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
    .where(and(validProgramCondition(), regionKeywordCondition(region.keywords)))
    .orderBy(programClosedSort(), asc(programs.applicationEnd), desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function listRecentProgramsForFeed(db: DbClient, limit: number): Promise<ProgramListItem[]> {
  return db.select(programListFields).from(programs).where(validProgramCondition()).orderBy(desc(programs.lastSyncedAt)).limit(limit);
}

export async function getProgramBySlug(db: DbClient, slug: string): Promise<ProgramListItem | null> {
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
  limit: number
): Promise<ProgramListItem[]> {
  const relatedConditions = [
    program.categoryCode ? eq(programs.categoryCode, program.categoryCode) : undefined,
    program.agency ? eq(programs.agency, program.agency) : undefined,
    program.executor ? eq(programs.executor, program.executor) : undefined
  ].filter(Boolean);

  const regionConditions = findRegionsForProgram(program).map((region) => regionKeywordCondition(region.keywords));

  if (relatedConditions.length === 0 && regionConditions.length === 0) {
    return [];
  }

  if (regionConditions.length > 0) {
    relatedConditions.push(or(...regionConditions));
  }

  return db
    .select(programListFields)
    .from(programs)
    .where(and(validProgramCondition(), ne(programs.id, program.id), or(...relatedConditions)))
    .orderBy(programClosedSort(), asc(programs.applicationEnd), desc(programs.lastSyncedAt))
    .limit(limit);
}

export async function listProgramSlugsForSitemap(db: DbClient, limit: number) {
  return db
    .select({
      slug: programs.slug,
      lastModified: programs.lastSyncedAt
    })
    .from(programs)
    .where(validProgramCondition())
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
    .where(and(validProgramCondition(), isNotNull(programs.categoryCode)))
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
    .where(and(validProgramCondition(), regionKeywordCondition(region.keywords)));

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

function validProgramCondition() {
  return or(isNull(programs.categoryCode), inArray(programs.categoryCode, PROGRAM_CATEGORY_LABELS));
}

function programFilterCondition(filters: ProgramFilterInput) {
  const conditions = [
    filters.categoryCode ? eq(programs.categoryCode, filters.categoryCode) : undefined,
    filters.region ? regionKeywordCondition(filters.region.keywords) : undefined,
    filters.keyword ? programKeywordCondition(filters.keyword) : undefined
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
    like(programs.categoryCode, pattern)
  );
}

function programClosedSort() {
  const nowSeconds = Math.floor(Date.now() / 1000);

  return sql`case
    when ${programs.status} = 'closed' then 1
    when ${programs.applicationEnd} is not null and (${programs.applicationEnd} + 86399) < ${nowSeconds} then 1
    else 0
  end`;
}
