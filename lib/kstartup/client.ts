import { retryFetch } from "@/lib/http/retry-fetch";
import {
  DEFAULT_KSTARTUP_PAGE_SIZE,
  KSTARTUP_ENDPOINT,
  KSTARTUP_REQUEST_HEADERS,
} from "./constants";
import type { KstartupFetchResult, KstartupRawItem } from "./types";

type FetchKstartupInput = {
  serviceKey: string;
  pageNo?: number;
  numOfRows?: number;
};

export async function fetchKstartupPrograms(
  input: FetchKstartupInput,
): Promise<KstartupFetchResult> {
  const url = new URL(KSTARTUP_ENDPOINT);
  url.searchParams.set("serviceKey", input.serviceKey);
  url.searchParams.set("returnType", "json");
  url.searchParams.set("pageNo", String(input.pageNo ?? 1));
  url.searchParams.set(
    "numOfRows",
    String(input.numOfRows ?? DEFAULT_KSTARTUP_PAGE_SIZE),
  );

  const response = await retryFetch(url, {
    headers: { ...KSTARTUP_REQUEST_HEADERS, accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`K-Startup API request failed: ${response.status}`);
  }

  const payload: unknown = await response.json();
  const { items, totalCount } = extractKstartupItems(payload);

  return {
    items,
    totalCount,
    requestedUrl: redactServiceKey(url),
  };
}

export function extractKstartupItems(payload: unknown): {
  items: KstartupRawItem[];
  totalCount: number;
} {
  if (!isRecord(payload)) return { items: [], totalCount: 0 };

  // Current API format: { currentCount: N, data: [...] }
  if (Array.isArray(payload.data)) {
    const items = payload.data.filter(isRecord);
    const totalCount =
      typeof payload.totalCount === "number"
        ? payload.totalCount
        : typeof payload.currentCount === "number"
          ? payload.currentCount
          : items.length;
    return { items, totalCount };
  }

  // Fallback: response.body.items
  const body = isRecord(payload.response)
    ? payload.response.body
    : (payload.body ?? payload);

  if (!isRecord(body)) return { items: [], totalCount: 0 };

  const totalCount =
    typeof body.totalCount === "number"
      ? body.totalCount
      : typeof body.totalCount === "string"
        ? Number(body.totalCount)
        : 0;

  const rawItems = body.items;

  if (Array.isArray(rawItems)) {
    return { items: rawItems.filter(isRecord), totalCount };
  }

  if (isRecord(rawItems)) {
    const inner = rawItems.item;
    if (Array.isArray(inner))
      return { items: inner.filter(isRecord), totalCount };
    if (isRecord(inner)) return { items: [inner], totalCount };
  }

  return { items: [], totalCount };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function redactServiceKey(url: URL) {
  const cloned = new URL(url);
  cloned.searchParams.set("serviceKey", "***");
  return cloned.toString();
}
