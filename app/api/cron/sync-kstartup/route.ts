import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";
import { hasRequiredEnv, getRequiredEnv } from "@/lib/env";
import { fetchKstartupPrograms } from "@/lib/kstartup/client";
import { normalizeKstartupItem } from "@/lib/kstartup/normalize";
import { kstartupSyncQuerySchema } from "@/lib/kstartup/types";
import {
  upsertPrograms,
  refreshProgramStatuses,
} from "@/lib/programs/repository";

const REQUIRED_ENV = ["KSTARTUP_SERVICE_KEY", "TURSO_DATABASE_URL"];

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasRequiredEnv(REQUIRED_ENV)) {
    return NextResponse.json(
      { error: "missing_env", required: REQUIRED_ENV },
      { status: 503 },
    );
  }

  const parsed = kstartupSyncQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_query", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const now = new Date();
  const fetchResult = await fetchKstartupPrograms({
    serviceKey: getRequiredEnv("KSTARTUP_SERVICE_KEY"),
    ...parsed.data,
  });

  const normalized = fetchResult.items
    .map((item) => normalizeKstartupItem(item, now))
    .filter((p) => p !== null);

  const db = getDb();
  const result = await upsertPrograms(db, normalized);
  const refreshed = await refreshProgramStatuses(db);

  return NextResponse.json({
    ok: true,
    source: "kstartup",
    fetched: fetchResult.items.length,
    totalCount: fetchResult.totalCount,
    normalized: normalized.length,
    insertedOrUpdated: result.insertedOrUpdated,
    refreshed,
    requestedUrl: fetchResult.requestedUrl,
  });
}
