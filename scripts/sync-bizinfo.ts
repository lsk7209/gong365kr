import { getDb } from "@/db";
import { fetchBizinfoPrograms } from "@/lib/bizinfo/client";
import { DEFAULT_BIZINFO_PAGE_UNIT } from "@/lib/bizinfo/constants";
import { normalizeBizinfoItem } from "@/lib/bizinfo/normalize";
import { getRequiredEnv } from "@/lib/env";
import { refreshProgramStatuses, upsertPrograms } from "@/lib/programs/repository";

const DEFAULT_PAGE_INDEX = 1;

async function main() {
  const now = new Date();
  const pageIndex = readNumberArg("pageIndex", DEFAULT_PAGE_INDEX);
  const pageUnit = readNumberArg("pageUnit", DEFAULT_BIZINFO_PAGE_UNIT);
  const fetchResult = await fetchBizinfoPrograms({
    apiKey: getRequiredEnv("BIZINFO_API_KEY"),
    pageIndex,
    pageUnit
  });
  const normalizedPrograms = fetchResult.items
    .map((item) => normalizeBizinfoItem(item, now))
    .filter((program) => program !== null);
  const db = getDb();
  const result = await upsertPrograms(db, normalizedPrograms);
  const refreshed = await refreshProgramStatuses(db, now);

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      source: "bizinfo",
      pageIndex,
      pageUnit,
      fetched: fetchResult.items.length,
      normalized: normalizedPrograms.length,
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
    throw new Error(`${name} 인자는 1 이상의 정수여야 합니다.`);
  }

  return parsed;
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
