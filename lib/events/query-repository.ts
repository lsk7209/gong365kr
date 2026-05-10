import { and, asc, count, desc, eq, isNotNull, like, not, or, sql } from "drizzle-orm";
import type { getDb } from "@/db";
import { events } from "@/db/schema";
import type { EventListItem } from "./display";

type DbClient = ReturnType<typeof getDb>;

export type EventFilterInput = {
  areaName?: string;
  eventType?: string;
  keyword?: string;
};

export type EventFacet = {
  label: string;
  count: number;
};

export async function listUpcomingEvents(
  db: DbClient,
  limit: number,
  now = new Date(),
  filters: EventFilterInput = {}
): Promise<EventListItem[]> {
  return listOpenEvents(db, limit, filters, now);
}

export async function listOpenEvents(
  db: DbClient,
  limit: number,
  filters: EventFilterInput = {},
  now = new Date()
): Promise<EventListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return db
    .select(eventListFields)
    .from(events)
    .where(and(eventFilterCondition(filters), not(isEventClosedCondition(nowSeconds))))
    .orderBy(
      asc(sql`coalesce(${events.eventStart}, ${events.receptionEnd}, ${events.eventEnd}, ${events.lastSyncedAt})`),
      desc(events.lastSyncedAt)
    )
    .limit(limit);
}

export async function listClosedEvents(
  db: DbClient,
  limit: number,
  now = new Date(),
  filters: EventFilterInput = {}
): Promise<EventListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return db
    .select(eventListFields)
    .from(events)
    .where(and(eventFilterCondition(filters), isEventClosedCondition(nowSeconds)))
    .orderBy(
      asc(sql`coalesce(${events.eventEnd}, ${events.eventStart}, ${events.lastSyncedAt})`),
      desc(events.lastSyncedAt)
    )
    .limit(limit);
}

export async function listRecentEvents(
  db: DbClient,
  limit: number,
  now = new Date()
): Promise<EventListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return db
    .select(eventListFields)
    .from(events)
    .where(not(isEventClosedCondition(nowSeconds)))
    .orderBy(desc(events.lastSyncedAt))
    .limit(limit);
}

export async function getEventBySlug(db: DbClient, slug: string): Promise<EventListItem | null> {
  const [event] = await db.select(eventListFields).from(events).where(eq(events.slug, slug)).limit(1);

  return event ?? null;
}

export async function listEventAreas(db: DbClient, limit = 20): Promise<EventFacet[]> {
  const areaCount = count();
  const rows = await db
    .select({
      label: events.areaName,
      count: areaCount
    })
    .from(events)
    .where(isNotNull(events.areaName))
    .groupBy(events.areaName)
    .orderBy(desc(areaCount), asc(events.areaName))
    .limit(limit);

  return rows
    .filter((row): row is { label: string; count: number } => Boolean(row.label))
    .map((row) => ({
      label: row.label,
      count: row.count
    }));
}

export async function listEventTypes(db: DbClient, limit = 20): Promise<EventFacet[]> {
  const typeCount = count();
  const rows = await db
    .select({
      label: events.eventType,
      count: typeCount
    })
    .from(events)
    .where(isNotNull(events.eventType))
    .groupBy(events.eventType)
    .orderBy(desc(typeCount), asc(events.eventType))
    .limit(limit);

  return rows
    .filter((row): row is { label: string; count: number } => Boolean(row.label))
    .map((row) => ({
      label: row.label,
      count: row.count
    }));
}

export async function listEventSlugsForSitemap(db: DbClient, limit: number) {
  return db
    .select({
      slug: events.slug,
      lastModified: events.lastSyncedAt
    })
    .from(events)
    .orderBy(desc(events.lastSyncedAt))
    .limit(limit);
}

const eventListFields = {
  id: events.id,
  eventInfoId: events.eventInfoId,
  slug: events.slug,
  title: events.title,
  summaryShort: events.summaryShort,
  areaName: events.areaName,
  eventType: events.eventType,
  originOrg: events.originOrg,
  categoryCode: events.categoryCode,
  receptionStart: events.receptionStart,
  receptionEnd: events.receptionEnd,
  eventStart: events.eventStart,
  eventEnd: events.eventEnd,
  status: events.status,
  rawUrl: events.rawUrl,
  originUrl: events.originUrl,
  attachmentUrl: events.attachmentUrl,
  attachmentName: events.attachmentName,
  printFileUrl: events.printFileUrl,
  printFileName: events.printFileName,
  createdAt: events.createdAt,
  lastSyncedAt: events.lastSyncedAt
};

function eventFilterCondition(filters: EventFilterInput) {
  const conditions = [
    filters.areaName ? eq(events.areaName, filters.areaName) : undefined,
    filters.eventType ? eq(events.eventType, filters.eventType) : undefined,
    filters.keyword ? eventKeywordCondition(filters.keyword) : undefined
  ].filter(Boolean);

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function eventKeywordCondition(keyword: string) {
  const pattern = `%${keyword}%`;

  return or(
    like(events.title, pattern),
    like(events.summaryShort, pattern),
    like(events.originOrg, pattern),
    like(events.areaName, pattern),
    like(events.eventType, pattern)
  );
}

function isEventClosedCondition(nowSeconds: number) {
  return or(
    sql`${events.status} = 'closed'`,
    and(isNotNull(events.eventEnd), sql`${events.eventEnd} + 86399 < ${nowSeconds}`)
  );
}
