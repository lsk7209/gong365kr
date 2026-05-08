import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { fetchBizinfoPrograms } from "@/lib/bizinfo/client";
import { normalizeBizinfoItem } from "@/lib/bizinfo/normalize";
import { bizinfoSyncQuerySchema } from "@/lib/bizinfo/types";
import { getRequiredEnv, hasRequiredEnv } from "@/lib/env";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";
import { upsertPrograms } from "@/lib/programs/repository";

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
  const fetchResult = await fetchBizinfoPrograms({
    apiKey: getRequiredEnv("BIZINFO_API_KEY"),
    ...parsedQuery.data
  });
  const normalizedPrograms = fetchResult.items
    .map((item) => normalizeBizinfoItem(item, now))
    .filter((program) => program !== null);
  const result = await upsertPrograms(getDb(), normalizedPrograms);

  return NextResponse.json({
    ok: true,
    source: "bizinfo",
    fetched: fetchResult.items.length,
    normalized: normalizedPrograms.length,
    insertedOrUpdated: result.insertedOrUpdated,
    requestedUrl: fetchResult.requestedUrl
  });
}
