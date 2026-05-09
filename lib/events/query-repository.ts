import { asc, desc, eq, sql } from "drizzle-orm";
import type { getDb } from "@/db";
import { events } from "@/db/schema";
import type { EventListItem } from "./display";

type DbClient = ReturnType<typeof getDb>;

export async function listUpcomingEvents(db: DbClient, limit: number, now = new Date()): Promise<EventListItem[]> {
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return db
    .select(eventListFields)
    .from(events)
    .where(sql`${events.status} <> 'closed' and (${events.eventEnd} is null or ${events.eventEnd} >= ${nowSeconds})`)
    .orderBy(asc(sql`coalesce(${events.eventStart}, ${events.receptionEnd}, ${events.eventEnd}, ${events.lastSyncedAt})`), desc(events.lastSyncedAt))
    .limit(limit);
}

export async function listRecentEvents(db: DbClient, limit: number): Promise<EventListItem[]> {
  return db.select(eventListFields).from(events).orderBy(desc(events.lastSyncedAt)).limit(limit);
}

export async function getEventBySlug(db: DbClient, slug: string): Promise<EventListItem | null> {
  const [event] = await db.select(eventListFields).from(events).where(eq(events.slug, slug)).limit(1);

  return event ?? null;
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
