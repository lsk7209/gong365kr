import { BIZINFO_ENDPOINT, BIZINFO_EVENT_ENDPOINT, BIZINFO_REQUEST_HEADERS, DEFAULT_BIZINFO_PAGE_UNIT } from "./constants";
import type { BizinfoFetchResult, BizinfoRawItem } from "./types";
import { retryFetch } from "@/lib/http/retry-fetch";

type FetchBizinfoItemsInput = {
  apiKey: string;
  pageIndex?: number;
  pageUnit?: number;
  hashtags?: string;
};

export async function fetchBizinfoPrograms(input: FetchBizinfoItemsInput): Promise<BizinfoFetchResult> {
  return fetchBizinfoItems(BIZINFO_ENDPOINT, input);
}

export async function fetchBizinfoEvents(input: FetchBizinfoItemsInput): Promise<BizinfoFetchResult> {
  return fetchBizinfoItems(BIZINFO_EVENT_ENDPOINT, input);
}

async function fetchBizinfoItems(endpoint: string, input: FetchBizinfoItemsInput): Promise<BizinfoFetchResult> {
  const url = new URL(endpoint);
  url.searchParams.set("crtfcKey", input.apiKey);
  url.searchParams.set("dataType", "json");
  url.searchParams.set("pageIndex", String(input.pageIndex ?? 1));
  url.searchParams.set("pageUnit", String(input.pageUnit ?? DEFAULT_BIZINFO_PAGE_UNIT));

  if (input.hashtags) {
    url.searchParams.set("hashtags", input.hashtags);
  }

  let response: Response;

  try {
    response = await retryFetch(url, {
      headers: {
        ...BIZINFO_REQUEST_HEADERS,
        accept: "application/json"
      },
      next: {
        revalidate: 0
      }
    });
  } catch (error) {
    throw new Error(`Bizinfo API request failed after retries: ${redactApiKey(url)}`, {
      cause: error
    });
  }

  if (!response.ok) {
    throw new Error(`Bizinfo API request failed: ${response.status} ${redactApiKey(url)}`);
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
