import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { fetchBizinfoPrograms } from "@/lib/bizinfo/client";
import { normalizeBizinfoItem } from "@/lib/bizinfo/normalize";
import { bizinfoSyncQuerySchema } from "@/lib/bizinfo/types";
import { getRequiredEnv, hasRequiredEnv } from "@/lib/env";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";
import {
  buildSearchSubmitSourceInfo,
  getSearchSubmitReadiness,
  evaluateSearchSubmitHealth,
  formatSearchSubmitHealthMessage,
  requiredSearchSubmitActions,
  getSearchSubmitHttpStatus,
  getSearchSubmitNextRetryAt,
  getSearchSubmitRetryAfterSeconds,
  summarizeSearchSubmit,
  submitSearchIndexNow,
} from "@/lib/search-submit";
import {
  refreshFacetCounts,
  refreshProgramStatuses,
  upsertPrograms,
} from "@/lib/programs/repository";

const REQUIRED_RUNTIME_ENV = ["BIZINFO_API_KEY", "TURSO_DATABASE_URL"];
const BIZINFO_PROVIDER = "공공데이터포털(Bizinfo)";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasRequiredEnv(REQUIRED_RUNTIME_ENV)) {
    return NextResponse.json(
      {
        error: "missing_runtime_env",
        required: REQUIRED_RUNTIME_ENV,
      },
      { status: 503 },
    );
  }

  const parsedQuery = bizinfoSyncQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: "invalid_query",
        issues: parsedQuery.error.issues,
      },
      { status: 400 },
    );
  }

  const now = new Date();
  const fetchResult = await fetchBizinfoPrograms({
    apiKey: getRequiredEnv("BIZINFO_API_KEY"),
    ...parsedQuery.data,
  });
  const normalizedPrograms = fetchResult.items
    .map((item) => normalizeBizinfoItem(item, now))
    .filter((program) => program !== null);
  const db = getDb();
  const result = await upsertPrograms(db, normalizedPrograms);
  const refreshed = await refreshProgramStatuses(db);
  // 무거운 facet 집계는 sync 시점(6시간 1회)에만 사전계산해 적재한다.
  await refreshFacetCounts(db);
  const [searchSubmit, readiness] = await Promise.all([
    submitSearchIndexNow(),
    getSearchSubmitReadiness(),
  ]);
  const searchSubmitSummary = summarizeSearchSubmit(searchSubmit);
  const health = evaluateSearchSubmitHealth(readiness, searchSubmitSummary);
  const message = formatSearchSubmitHealthMessage(health);
  const requiredActions = requiredSearchSubmitActions(health);
  const httpStatus = getSearchSubmitHttpStatus(health);
  const retryAfterSeconds = getSearchSubmitRetryAfterSeconds(health);
  const nextRetryAt = getSearchSubmitNextRetryAt(health);
  const responseInit = retryAfterSeconds
    ? {
        status: httpStatus,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    : { status: httpStatus };

  return NextResponse.json(
    {
      ok: true,
      message,
      status: health.status,
      requiredActions,
      nextRetryAt,
      retryAfterSeconds,
      source: "bizinfo",
      fetched: fetchResult.items.length,
      normalized: normalizedPrograms.length,
      insertedOrUpdated: result.insertedOrUpdated,
      refreshed: refreshed,
      sourceInfo: buildSearchSubmitSourceInfo({
        provider: BIZINFO_PROVIDER,
        query: {
          pageIndex: parsedQuery.data.pageIndex,
          pageUnit: parsedQuery.data.pageUnit,
          dataType: "json",
          hashtags: parsedQuery.data.hashtags ?? null,
        },
        source: "bizinfoPrograms",
        requestedUrl: fetchResult.requestedUrl,
        fetchedCount: fetchResult.items.length,
        normalizedCount: normalizedPrograms.length,
        sampleCount: Math.min(3, normalizedPrograms.length),
        at: now,
      }),
      requestedUrl: fetchResult.requestedUrl,
      searchSubmitSummary,
      health,
      readiness,
      searchSubmit,
    },
    responseInit,
  );
}
