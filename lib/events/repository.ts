import { sql } from "drizzle-orm";
import { events } from "@/db/schema";
import type { getDb } from "@/db";
import type { EventUpsertInput } from "./types";

type DbClient = ReturnType<typeof getDb>;

export async function upsertEvents(db: DbClient, inputs: EventUpsertInput[]) {
  if (inputs.length === 0) {
    return { insertedOrUpdated: 0 };
  }

  await db
    .insert(events)
    .values(inputs)
    .onConflictDoUpdate({
      target: events.eventInfoId,
      set: {
        source: sql.raw("excluded.source"),
        slug: sql.raw("excluded.slug"),
        title: sql.raw("excluded.title"),
        summaryShort: sql.raw("excluded.summary_short"),
        areaName: sql.raw("excluded.area_name"),
        eventType: sql.raw("excluded.event_type"),
        originOrg: sql.raw("excluded.origin_org"),
        categoryCode: sql.raw("excluded.category_code"),
        receptionStart: sql.raw("excluded.reception_start"),
        receptionEnd: sql.raw("excluded.reception_end"),
        eventStart: sql.raw("excluded.event_start"),
        eventEnd: sql.raw("excluded.event_end"),
        status: sql.raw("excluded.status"),
        rawUrl: sql.raw("excluded.raw_url"),
        originUrl: sql.raw("excluded.origin_url"),
        attachmentUrl: sql.raw("excluded.attachment_url"),
        attachmentName: sql.raw("excluded.attachment_name"),
        printFileUrl: sql.raw("excluded.print_file_url"),
        printFileName: sql.raw("excluded.print_file_name"),
        rawJson: sql.raw("excluded.raw_json"),
        lastSyncedAt: sql.raw("excluded.last_synced_at")
      }
    });

  return { insertedOrUpdated: inputs.length };
}
