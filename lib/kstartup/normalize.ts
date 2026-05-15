import { isKnownProgramCategory } from "@/lib/programs/display";
import { createProgramSlug } from "@/lib/programs/slug";
import { calculateProgramStatus } from "@/lib/programs/status";
import type { ProgramUpsertInput } from "@/lib/programs/types";
import { KSTARTUP_CATEGORY_MAP } from "./constants";
import type { KstartupRawItem } from "./types";

const KSTARTUP_DETAIL_BASE =
  "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=";

export function normalizeKstartupItem(
  item: KstartupRawItem,
  now = new Date(),
): ProgramUpsertInput | null {
  const pbancSn = readString(item, ["pbanc_sn"]);
  const title = readString(item, ["biz_pbanc_nm"]);

  if (!pbancSn || !title) return null;

  const pblancId = `kstartup-${pbancSn}`;
  const rawUrl =
    readString(item, ["detl_pg_url"]) ?? `${KSTARTUP_DETAIL_BASE}${pbancSn}`;
  const agency = readString(item, ["pbanc_ntrp_nm"]);
  const executor = readString(item, ["biz_prch_dprt_nm"]);
  const categoryCode = normalizeCategory(readString(item, ["supt_biz_clsfc"]));
  const applicationStart = parseKstartupDate(
    readString(item, ["pbanc_rcpt_bgng_dt"]),
  );
  const applicationEnd = parseKstartupDate(
    readString(item, ["pbanc_rcpt_end_dt"]),
  );
  const createdAt = applicationStart ?? now;
  const year =
    applicationStart?.getFullYear() ??
    applicationEnd?.getFullYear() ??
    now.getFullYear();

  const summaryShort = buildSummary(item);

  return {
    pblancId,
    source: "kstartup",
    slug: createProgramSlug({ categoryCode, title, year, pblancId }),
    title,
    summaryShort,
    agency,
    executor,
    categoryCode,
    applicationStart,
    applicationEnd,
    status: calculateProgramStatus({ applicationStart, applicationEnd, now }),
    rawUrl,
    detailPdfUrl: null,
    rawJson: JSON.stringify(item),
    lastSyncedAt: now,
    createdAt,
  };
}

function buildSummary(item: KstartupRawItem): string | null {
  const content = readString(item, ["pbanc_ctnt"]);
  const target = readString(item, ["aply_trgt_ctnt"]);
  const region = readString(item, ["supt_regin"]);

  const parts: string[] = [];
  if (content) parts.push(content);
  if (target) parts.push(`[지원대상] ${target}`);
  if (region) parts.push(`[지역] ${region}`);

  const combined = parts.join(" ").replace(/\s+/g, " ").trim();
  return combined || null;
}

function normalizeCategory(value: string | null): string | null {
  if (!value) return null;

  for (const [keyword, mapped] of Object.entries(KSTARTUP_CATEGORY_MAP)) {
    if (value.includes(keyword)) {
      return isKnownProgramCategory(mapped) ? mapped : null;
    }
  }
  return null;
}

function readString(item: KstartupRawItem, keys: string[]): string | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) {
      return value
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    if (typeof value === "number") return String(value);
  }
  return null;
}

function parseKstartupDate(value: string | null): Date | null {
  if (!value) return null;

  const compact = value.replace(/\D/g, "").slice(0, 8);
  if (compact.length !== 8) return null;

  const year = Number(compact.slice(0, 4));
  const month = Number(compact.slice(4, 6));
  const day = Number(compact.slice(6, 8));

  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day));
}
