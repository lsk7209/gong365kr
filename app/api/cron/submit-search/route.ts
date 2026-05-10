import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/http/cron-auth";
import {
  buildSearchSubmitSourceInfo,
  evaluateSearchSubmitHealth,
  formatSearchSubmitHealthMessage,
  getSearchSubmitHttpStatus,
  getSearchSubmitNextRetryAt,
  getSearchSubmitRetryAfterSeconds,
  requiredSearchSubmitActions,
  getSearchSubmitReadiness,
  summarizeSearchSubmit,
  submitSearchIndexNow
} from "@/lib/search-submit";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [searchSubmit, readiness] = await Promise.all([submitSearchIndexNow(), getSearchSubmitReadiness()]);
  const summary = summarizeSearchSubmit(searchSubmit);

  const health = evaluateSearchSubmitHealth(readiness, summary);
  const message = formatSearchSubmitHealthMessage(health);
  const requiredActions = requiredSearchSubmitActions(health);
  const httpStatus = getSearchSubmitHttpStatus(health);
  const retryAfterSeconds = getSearchSubmitRetryAfterSeconds(health);
  const nextRetryAt = getSearchSubmitNextRetryAt(health);
  const sourceInfo = buildSearchSubmitSourceInfo({
    provider: "search-submit-cron",
    query: {
      siteUrl: readiness.siteUrl,
      targetUrlCount: readiness.targetUrlCount,
      targetUrlSampleCount: readiness.targetUrlSample.length
    },
    source: "google-sitemap:indexnow",
    requestedUrl: readiness.siteUrl,
    fetchedCount: readiness.targetUrlCount,
    normalizedCount: summary.submitted + summary.failed,
    sampleCount: readiness.targetUrlSample.length,
    at: new Date()
  });
  const responseInit = retryAfterSeconds ? { status: httpStatus, headers: { "Retry-After": String(retryAfterSeconds) } } : { status: httpStatus };

  return NextResponse.json(
    {
      ok: true,
      message,
      status: health.status,
      requiredActions,
      nextRetryAt,
      retryAfterSeconds,
      readiness,
      summary,
      health,
      sourceInfo,
      targets: searchSubmit
    },
    responseInit
  );
}
