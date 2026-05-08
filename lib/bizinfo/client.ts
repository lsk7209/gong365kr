import { BIZINFO_ENDPOINT, DEFAULT_BIZINFO_PAGE_UNIT } from "./constants";
import type { BizinfoFetchResult, BizinfoRawItem } from "./types";

type FetchBizinfoProgramsInput = {
  apiKey: string;
  pageIndex?: number;
  pageUnit?: number;
  hashtags?: string;
};

export async function fetchBizinfoPrograms(input: FetchBizinfoProgramsInput): Promise<BizinfoFetchResult> {
  const url = new URL(BIZINFO_ENDPOINT);
  url.searchParams.set("crtfcKey", input.apiKey);
  url.searchParams.set("dataType", "json");
  url.searchParams.set("pageIndex", String(input.pageIndex ?? 1));
  url.searchParams.set("pageUnit", String(input.pageUnit ?? DEFAULT_BIZINFO_PAGE_UNIT));

  if (input.hashtags) {
    url.searchParams.set("hashtags", input.hashtags);
  }

  const response = await fetch(url, {
    headers: {
      accept: "application/json"
    },
    next: {
      revalidate: 0
    }
  });

  if (!response.ok) {
    throw new Error(`기업마당 API 호출 실패: ${response.status}`);
  }

  const payload: unknown = await response.json();

  return {
    items: extractBizinfoItems(payload),
    requestedUrl: redactApiKey(url)
  };
}

export function extractBizinfoItems(payload: unknown): BizinfoRawItem[] {
  if (!isRecord(payload)) {
    return [];
  }

  const jsonArray = payload.jsonArray;

  if (Array.isArray(jsonArray)) {
    return jsonArray.filter(isRecord);
  }

  if (isRecord(jsonArray) && Array.isArray(jsonArray.item)) {
    return jsonArray.item.filter(isRecord);
  }

  if (isRecord(jsonArray) && isRecord(jsonArray.item)) {
    return [jsonArray.item];
  }

  if (Array.isArray(payload.item)) {
    return payload.item.filter(isRecord);
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function redactApiKey(url: URL) {
  const cloned = new URL(url);
  cloned.searchParams.set("crtfcKey", "***");

  return cloned.toString();
}
