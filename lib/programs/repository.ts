import { sql } from "drizzle-orm";
import { programs } from "@/db/schema";
import type { getDb } from "@/db";
import { toUnixSeconds } from "./status";
import type { ProgramUpsertInput } from "./types";

type DbClient = ReturnType<typeof getDb>;

export async function upsertPrograms(db: DbClient, inputs: ProgramUpsertInput[]) {
  if (inputs.length === 0) {
    return { insertedOrUpdated: 0 };
  }

  await db
    .insert(programs)
    .values(inputs)
    .onConflictDoUpdate({
      target: programs.pblancId,
      set: {
        source: sql.raw("excluded.source"),
        slug: sql.raw("excluded.slug"),
        title: sql.raw("excluded.title"),
        summaryShort: sql.raw("excluded.summary_short"),
        agency: sql.raw("excluded.agency"),
        executor: sql.raw("excluded.executor"),
        categoryCode: sql.raw("excluded.category_code"),
        applicationStart: sql.raw("excluded.application_start"),
        applicationEnd: sql.raw("excluded.application_end"),
        status: sql.raw("excluded.status"),
        rawUrl: sql.raw("excluded.raw_url"),
        detailPdfUrl: sql.raw("excluded.detail_pdf_url"),
        rawJson: sql.raw("excluded.raw_json"),
        lastSyncedAt: sql.raw("excluded.last_synced_at")
      }
    });

  return { insertedOrUpdated: inputs.length };
}

export async function refreshProgramStatuses(db: DbClient, now = new Date()) {
  const nowSeconds = toUnixSeconds(now);

  const closed = await db
    .update(programs)
    .set({
      status: "closed",
      lastSyncedAt: now
    })
    .where(sql`${programs.applicationEnd} is not null and ${programs.applicationEnd} < ${nowSeconds}`);

  const upcoming = await db
    .update(programs)
    .set({
      status: "upcoming",
      lastSyncedAt: now
    })
    .where(sql`${programs.applicationStart} is not null and ${programs.applicationStart} > ${nowSeconds}`);

  const active = await db
    .update(programs)
    .set({
      status: "active",
      lastSyncedAt: now
    })
    .where(
      sql`(${programs.applicationStart} is null or ${programs.applicationStart} <= ${nowSeconds})
        and (${programs.applicationEnd} is null or ${programs.applicationEnd} >= ${nowSeconds})`
    );

  return {
    closed: Number(closed.rowsAffected),
    upcoming: Number(upcoming.rowsAffected),
    active: Number(active.rowsAffected)
  };
}
