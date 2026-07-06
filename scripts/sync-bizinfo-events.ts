import { getDb } from "@/db";
import { fetchBizinfoEvents } from "@/lib/bizinfo/client";
import { DEFAULT_BIZINFO_PAGE_UNIT } from "@/lib/bizinfo/constants";
import { normalizeBizinfoEventItem } from "@/lib/bizinfo/event-normalize";
import { getRequiredEnv } from "@/lib/env";
import { refreshEventStatuses, upsertEvents } from "@/lib/events/repository";

const DEFAULT_PAGE_INDEX = 1;

async function main() {
  const now = new Date();
  const pageIndex = readNumberArg("pageIndex", DEFAULT_PAGE_INDEX);
  const pageUnit = readNumberArg("pageUnit", DEFAULT_BIZINFO_PAGE_UNIT);
  const fetchResult = await fetchBizinfoEvents({
    apiKey: getRequiredEnv("BIZINFO_API_KEY"),
    pageIndex,
    pageUnit
  });
  const normalizedEvents = fetchResult.items.map((item) => normalizeBizinfoEventItem(item, now)).filter((event) => event !== null);
  const db = getDb();
  const result = await upsertEvents(db, normalizedEvents);
  const refreshed = await refreshEventStatuses(db, now);

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      source: "bizinfo-events",
      pageIndex,
      pageUnit,
      fetched: fetchResult.items.length,
      normalized: normalizedEvents.length,
      insertedOrUpdated: result.insertedOrUpdated,
      refreshed,
      requestedUrl: fetchResult.requestedUrl
    })}\n`
  );
}

function readNumberArg(name: string, fallback: number) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);

  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be an integer greater than 0`);
  }

  return parsed;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Bizinfo API request failed after retries")) {
    process.stdout.write(
      `${JSON.stringify({
        ok: false,
        skipped: true,
        source: "bizinfo-events",
        reason: "transient_bizinfo_fetch_failed",
        message
      })}\n`
    );
    process.exitCode = 0;
    return;
  }

  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
