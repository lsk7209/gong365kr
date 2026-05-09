import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { fetchBizinfoEvents } from "@/lib/bizinfo/client";
import { normalizeBizinfoEventItem } from "@/lib/bizinfo/event-normalize";
import { bizinfoSyncQuerySchema } from "@/lib/bizinfo/types";
import { getRequiredEnv, hasRequiredEnv } from "@/lib/env";
import { upsertEvents } from "@/lib/events/repository";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";

const REQUIRED_RUNTIME_ENV = ["BIZINFO_API_KEY", "TURSO_DATABASE_URL"];

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasRequiredEnv(REQUIRED_RUNTIME_ENV)) {
    return NextResponse.json(
      {
        error: "missing_runtime_env",
        required: REQUIRED_RUNTIME_ENV
      },
      { status: 503 }
    );
  }

  const parsedQuery = bizinfoSyncQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: "invalid_query",
        issues: parsedQuery.error.issues
      },
      { status: 400 }
    );
  }

  const now = new Date();
  const fetchResult = await fetchBizinfoEvents({
    apiKey: getRequiredEnv("BIZINFO_API_KEY"),
    ...parsedQuery.data
  });
  const normalizedEvents = fetchResult.items
    .map((item) => normalizeBizinfoEventItem(item, now))
    .filter((event) => event !== null);
  const result = await upsertEvents(getDb(), normalizedEvents);

  return NextResponse.json({
    ok: true,
    source: "bizinfo-events",
    fetched: fetchResult.items.length,
    normalized: normalizedEvents.length,
    insertedOrUpdated: result.insertedOrUpdated,
    requestedUrl: fetchResult.requestedUrl
  });
}
