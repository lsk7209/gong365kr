import { BIZINFO_DETAIL_URL } from "./constants";
import type { BizinfoRawItem } from "./types";
import { createProgramSlug } from "@/lib/programs/slug";
import { calculateProgramStatus } from "@/lib/programs/status";
import type { ProgramUpsertInput } from "@/lib/programs/types";

const FIELD_CANDIDATES = {
  pblancId: ["pblancId", "seq"],
  title: ["pblancNm", "title"],
  summaryShort: ["bsnsSumryCn", "description"],
  rawUrl: ["pblancUrl", "link"],
  agency: ["jrsdInsttNm", "author"],
  executor: ["excInsttNm"],
  categoryCode: ["pldirSportRealmLclasCodeNm", "lcategory"],
  createdAt: ["creatPnttm", "pubDate"],
  period: ["reqstBeginEndDe", "reqstDt"]
} as const;

export function normalizeBizinfoItem(item: BizinfoRawItem, now = new Date()): ProgramUpsertInput | null {
  const pblancId = readString(item, FIELD_CANDIDATES.pblancId);
  const title = readString(item, FIELD_CANDIDATES.title);

  if (!pblancId || !title) {
    return null;
  }

  const categoryCode = readString(item, FIELD_CANDIDATES.categoryCode);
  const createdAt = parseDate(readString(item, FIELD_CANDIDATES.createdAt)) ?? now;
  const period = parseApplicationPeriod(readString(item, FIELD_CANDIDATES.period));
  const rawUrl = readString(item, FIELD_CANDIDATES.rawUrl) ?? createDetailUrl(pblancId);
  const year = period.start?.getFullYear() ?? period.end?.getFullYear() ?? createdAt.getFullYear();

  return {
    pblancId,
    source: "bizinfo",
    slug: createProgramSlug({ categoryCode, title, year, pblancId }),
    title,
    summaryShort: readString(item, FIELD_CANDIDATES.summaryShort),
    agency: readString(item, FIELD_CANDIDATES.agency),
    executor: readString(item, FIELD_CANDIDATES.executor),
    categoryCode,
    applicationStart: period.start,
    applicationEnd: period.end,
    status: calculateProgramStatus({
      applicationStart: period.start,
      applicationEnd: period.end,
      now
    }),
    rawUrl,
    detailPdfUrl: null,
    rawJson: JSON.stringify(item),
    lastSyncedAt: now,
    createdAt
  };
}

export function parseApplicationPeriod(value: string | null) {
  if (!value) {
    return { start: null, end: null };
  }

  const dateValues = value.match(/\d{4}[.-]\d{1,2}[.-]\d{1,2}/g) ?? [];

  return {
    start: parseDate(dateValues[0] ?? null),
    end: parseDate(dateValues[1] ?? null)
  };
}

function readString(item: BizinfoRawItem, keys: readonly string[]) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "string" && value.trim()) {
      return normalizeText(value);
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

function normalizeText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[.]/g, "-").match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0];

  if (!normalized) {
    return null;
  }

  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function createDetailUrl(pblancId: string) {
  const url = new URL(BIZINFO_DETAIL_URL);
  url.searchParams.set("pblancId", pblancId);

  return url.toString();
}
