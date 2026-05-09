import type { BizinfoRawItem } from "./types";
import { createEventSlug } from "@/lib/events/slug";
import type { EventStatus, EventUpsertInput } from "@/lib/events/types";

const FIELD_CANDIDATES = {
  eventInfoId: ["eventInfoId", "seq"],
  title: ["nttNm", "title"],
  summaryShort: ["nttCn", "description"],
  areaName: ["areaNm"],
  eventType: ["eventInfoTyNm", "eventType"],
  originOrg: ["originEngnNm", "originOrg"],
  originUrl: ["originUrlAdres", "originUrl"],
  rawUrl: ["bizinfoUrl", "link"],
  categoryCode: ["pldirSportRealmLclasCodeNm", "lcategory"],
  receptionPeriod: ["rceptPd"],
  eventPeriod: ["BeginEndDe", "eventPeriod"],
  createdAt: ["registDe", "pubDate"],
  attachmentUrl: ["flpthNm"],
  attachmentName: ["fileNm"],
  printFileUrl: ["printFlpthNm"],
  printFileName: ["printFileNm"]
} as const;

export function normalizeBizinfoEventItem(item: BizinfoRawItem, now = new Date()): EventUpsertInput | null {
  const eventInfoId = readString(item, FIELD_CANDIDATES.eventInfoId);
  const title = readString(item, FIELD_CANDIDATES.title);

  if (!eventInfoId || !title) {
    return null;
  }

  const eventPeriod = parseBizinfoPeriod(readString(item, FIELD_CANDIDATES.eventPeriod));
  const receptionPeriod = parseBizinfoPeriod(readString(item, FIELD_CANDIDATES.receptionPeriod));
  const createdAt = parseBizinfoDate(readString(item, FIELD_CANDIDATES.createdAt)) ?? now;
  const eventType = readString(item, FIELD_CANDIDATES.eventType);
  const areaName = readString(item, FIELD_CANDIDATES.areaName);
  const rawUrl = readString(item, FIELD_CANDIDATES.rawUrl) ?? readString(item, FIELD_CANDIDATES.originUrl);
  const year = eventPeriod.start?.getFullYear() ?? createdAt.getFullYear();

  if (!rawUrl) {
    return null;
  }

  return {
    eventInfoId,
    source: "bizinfo",
    slug: createEventSlug({
      eventInfoId,
      title,
      eventType,
      areaName,
      year
    }),
    title,
    summaryShort: readString(item, FIELD_CANDIDATES.summaryShort),
    areaName,
    eventType,
    originOrg: readString(item, FIELD_CANDIDATES.originOrg),
    categoryCode: readString(item, FIELD_CANDIDATES.categoryCode),
    receptionStart: receptionPeriod.start,
    receptionEnd: receptionPeriod.end,
    eventStart: eventPeriod.start,
    eventEnd: eventPeriod.end,
    status: calculateEventStatus(eventPeriod, now),
    rawUrl,
    originUrl: readString(item, FIELD_CANDIDATES.originUrl),
    attachmentUrl: readString(item, FIELD_CANDIDATES.attachmentUrl),
    attachmentName: readString(item, FIELD_CANDIDATES.attachmentName),
    printFileUrl: readString(item, FIELD_CANDIDATES.printFileUrl),
    printFileName: readString(item, FIELD_CANDIDATES.printFileName),
    rawJson: JSON.stringify(item),
    lastSyncedAt: now,
    createdAt
  };
}

export function parseBizinfoPeriod(value: string | null) {
  if (!value) {
    return { start: null, end: null };
  }

  const dateValues = value.match(/\d{4}[.-]\d{1,2}[.-]\d{1,2}|\d{8}/g) ?? [];

  return {
    start: parseBizinfoDate(dateValues[0] ?? null),
    end: parseBizinfoDate(dateValues[1] ?? null)
  };
}

function calculateEventStatus(period: { start: Date | null; end: Date | null }, now: Date): EventStatus {
  if (period.end && period.end < now) {
    return "closed";
  }

  if (period.start && period.start > now) {
    return "upcoming";
  }

  return "active";
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

function parseBizinfoDate(value: string | null) {
  if (!value) {
    return null;
  }

  const compact = value.match(/\d{8}/)?.[0];

  if (compact) {
    return createUtcDate(Number(compact.slice(0, 4)), Number(compact.slice(4, 6)), Number(compact.slice(6, 8)));
  }

  const dashed = value.replace(/[.]/g, "-").match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0];

  if (!dashed) {
    return null;
  }

  const [year, month, day] = dashed.split("-").map(Number);

  return createUtcDate(year, month, day);
}

function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}
