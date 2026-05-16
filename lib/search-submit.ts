import { createHash, createSign } from "node:crypto";
import { getSiteUrl, normalizeSiteUrl } from "@/lib/site";
import { readEventData } from "@/lib/events/page-data";
import { listEventSlugsForSitemap } from "@/lib/events/query-repository";
import { readProgramData } from "@/lib/programs/page-data";
import { listProgramSlugsForSitemap } from "@/lib/programs/query-repository";
import { getPublishedBlogSlugs } from "@/lib/blog/posts";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SITEMAP_SCOPE = "https://www.googleapis.com/auth/webmasters";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const NAVER_INDEXNOW_ENDPOINT = "https://searchadvisor.naver.com/indexnow";

const SITEMAP_PROGRAM_LIMIT = 500;
const SITEMAP_EVENT_LIMIT = 200;
const SUBMISSION_PROGRAM_LIMIT = 120;
const SUBMISSION_EVENT_LIMIT = 120;
const SUBMISSION_MONTH_LIMIT = 3;
const DEFAULT_URL_PATHS = [
  "/",
  "/check",
  "/programs",
  "/events",
  "/regions",
  "/blog",
  "/sitemap.xml",
  "/feed.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/ai-index.json",
  "/robots.txt",
] as const;
const STATIC_FILE_PATHS = [
  "/sitemap.xml",
  "/robots.txt",
  "/feed.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/ai-index.json",
] as const;

export type SearchSubmitTarget = {
  target: string;
  status: "submitted" | "skipped" | "failed";
  detail: string;
};

export type SearchSubmitReadiness = {
  siteUrl: string;
  targetUrlCount: number;
  targetUrlSample: string[];
  googleSitemap: {
    ready: boolean;
    detail: string;
  };
  indexNow: {
    ready: boolean;
    detail: string;
  };
  naverIndexNow: {
    ready: boolean;
    detail: string;
    enabled: boolean;
  };
};

type ServiceAccountInput = {
  clientEmail: string;
  privateKey: string;
};

export async function submitSearchIndexNow(): Promise<SearchSubmitTarget[]> {
  const siteUrl = getSearchSiteUrl();
  const urls = await createSubmissionUrls(siteUrl);

  const targets: Promise<SearchSubmitTarget>[] = [
    submitGoogleSitemap(siteUrl),
    submitIndexNow(siteUrl, urls, INDEXNOW_ENDPOINT, "indexnow"),
  ];

  if (isNaverIndexNowEnabled()) {
    targets.push(
      submitIndexNow(siteUrl, urls, NAVER_INDEXNOW_ENDPOINT, "indexnow-naver"),
    );
  }

  return Promise.all(targets);
}

export async function getSearchSubmitReadiness(): Promise<SearchSubmitReadiness> {
  const siteUrl = getSearchSiteUrl();
  const serviceAccount = checkServiceAccountReadiness();
  const indexNowEnabled = Boolean(process.env.INDEXNOW_KEY);
  const naverEnabled = isNaverIndexNowEnabled();

  let targetUrlCount = 0;
  let targetUrlSample: string[] = [];

  try {
    const urls = await createSubmissionUrls(siteUrl);
    targetUrlCount = urls.length;
    targetUrlSample = urls.slice(0, 5);
  } catch {
    targetUrlSample = [];
  }

  return {
    siteUrl,
    targetUrlCount,
    targetUrlSample,
    googleSitemap: {
      ready: serviceAccount.ready,
      detail: serviceAccount.detail,
    },
    indexNow: {
      ready: indexNowEnabled,
      detail: indexNowEnabled
        ? "INDEXNOW_KEY 환경변수 설정됨"
        : "INDEXNOW_KEY가 없음",
    },
    naverIndexNow: {
      ready: naverEnabled && indexNowEnabled,
      enabled: naverEnabled,
      detail: naverEnabled
        ? indexNowEnabled
          ? "ENABLE_NAVER_INDEXNOW 또는 SUBMIT_NAVER_INDEXNOW가 true이고 INDEXNOW_KEY 존재"
          : "네이버 전용 플래그 true이나 INDEXNOW_KEY 미설정"
        : "네이버 전송 비활성화(ENABLE_NAVER_INDEXNOW/SUBMIT_NAVER_INDEXNOW false)",
    },
  };
}

async function submitGoogleSitemap(
  siteUrl: string,
): Promise<SearchSubmitTarget> {
  const serviceAccount = readServiceAccount();

  if (!serviceAccount) {
    return {
      target: "google-sitemap",
      status: "skipped",
      detail: "GSC service account env is missing",
    };
  }

  try {
    const accessToken = await createGoogleAccessToken(serviceAccount);
    const propertyUrl = process.env.GSC_SITE_URL ?? siteUrl;
    const sitemapUrl = `${siteUrl}/sitemap.xml`;
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return {
        target: "google-sitemap",
        status: "failed",
        detail: `${response.status} ${await response.text()}`,
      };
    }

    return {
      target: "google-sitemap",
      status: "submitted",
      detail: sitemapUrl,
    };
  } catch (error) {
    return {
      target: "google-sitemap",
      status: "failed",
      detail:
        error instanceof Error ? error.message : "google sitemap submit failed",
    };
  }
}

async function submitIndexNow(
  siteUrl: string,
  urls: string[],
  endpoint: string,
  target: string,
): Promise<SearchSubmitTarget> {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return { target, status: "skipped", detail: "INDEXNOW_KEY env is missing" };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(siteUrl).host,
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: urls,
    }),
  });

  if (!response.ok && response.status !== 202) {
    return {
      target,
      status: "failed",
      detail: `${response.status} ${await response.text()}`,
    };
  }

  return {
    target,
    status: "submitted",
    detail: `${response.status} ${urls.length} urls`,
  };
}

function getSearchSiteUrl() {
  return normalizeSiteUrl(
    process.env.SEARCH_SUBMIT_SITE_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      getSiteUrl(),
  );
}

async function createSubmissionUrls(siteUrl: string) {
  const paths = new Set<string>([
    ...DEFAULT_URL_PATHS,
    ...createDeadlinePaths(),
    ...STATIC_FILE_PATHS,
  ]);
  const [programRows, eventRows] = await Promise.all([
    readProgramData([], (db) =>
      listProgramSlugsForSitemap(db, SITEMAP_PROGRAM_LIMIT),
    ),
    readEventData([], (db) =>
      listEventSlugsForSitemap(db, SITEMAP_EVENT_LIMIT),
    ),
  ]);

  for (const row of programRows.slice(0, SUBMISSION_PROGRAM_LIMIT)) {
    paths.add(`/programs/${row.slug}`);
  }

  for (const row of eventRows.slice(0, SUBMISSION_EVENT_LIMIT)) {
    paths.add(`/events/${row.slug}`);
  }

  for (const slug of getPublishedBlogSlugs()) {
    paths.add(`/blog/${slug}`);
  }

  return Array.from(paths).map(
    (path) => `${siteUrl}${path === "/" ? "" : path}`,
  );
}

function createDeadlinePaths() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return Array.from({ length: SUBMISSION_MONTH_LIMIT }, (_, index) => {
    const target = new Date(year, month - 1 + index, 1);
    const targetYear = target.getFullYear();
    const targetMonth = String(target.getMonth() + 1).padStart(2, "0");

    return `/deadline/${targetYear}/${targetMonth}`;
  });
}

function readServiceAccount(): ServiceAccountInput | null {
  const rawJson = process.env.GSC_SERVICE_ACCOUNT_JSON;

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as {
        client_email?: string;
        private_key?: string;
      };
      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key,
        };
      }
    } catch {
      return null;
    }
  }

  if (!process.env.GSC_CLIENT_EMAIL || !process.env.GSC_PRIVATE_KEY) {
    return null;
  }

  return {
    clientEmail: process.env.GSC_CLIENT_EMAIL,
    privateKey: process.env.GSC_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

function checkServiceAccountReadiness() {
  const rawJson = process.env.GSC_SERVICE_ACCOUNT_JSON;

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as {
        client_email?: string;
        private_key?: string;
      };

      if (parsed.client_email && parsed.private_key) {
        return { ready: true, detail: "GSC_SERVICE_ACCOUNT_JSON 사용 가능" };
      }

      return {
        ready: false,
        detail: "GSC_SERVICE_ACCOUNT_JSON에 client_email/private_key가 없음",
      };
    } catch {
      return { ready: false, detail: "GSC_SERVICE_ACCOUNT_JSON 파싱 실패" };
    }
  }

  if (!process.env.GSC_CLIENT_EMAIL || !process.env.GSC_PRIVATE_KEY) {
    return {
      ready: false,
      detail:
        "서비스계정 정보 없음. GSC_SERVICE_ACCOUNT_JSON 또는 GSC_CLIENT_EMAIL/GSC_PRIVATE_KEY 필요",
    };
  }

  return { ready: true, detail: "GSC_CLIENT_EMAIL/GSC_PRIVATE_KEY 사용 가능" };
}

function isNaverIndexNowEnabled() {
  return (
    process.env.ENABLE_NAVER_INDEXNOW === "true" ||
    process.env.SUBMIT_NAVER_INDEXNOW === "true"
  );
}

async function createGoogleAccessToken(input: ServiceAccountInput) {
  const now = Math.floor(Date.now() / 1000);
  const jwt = signJwt(
    {
      alg: "RS256",
      typ: "JWT",
    },
    {
      iss: input.clientEmail,
      scope: GOOGLE_SITEMAP_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    },
    input.privateKey,
  );
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Google token request failed: ${response.status} ${await response.text()}`,
    );
  }

  const parsed = (await response.json()) as { access_token?: string };
  if (!parsed.access_token) {
    throw new Error("Google token response did not include access_token");
  }

  return parsed.access_token;
}

function signJwt(header: object, payload: object, privateKey: string) {
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = createSign("RSA-SHA256")
    .update(unsignedToken)
    .sign(privateKey);

  return `${unsignedToken}.${base64Url(signature)}`;
}

function base64Url(input: string | Buffer) {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;

  return buffer
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function formatSubmitResults(
  fingerprintSeed: string,
  results: SearchSubmitTarget[],
) {
  if (results.length === 0) {
    return `${fingerprintSeed}: no submission targets`;
  }

  return results
    .map((result) => `${result.target}=${result.status}:${result.detail}`)
    .join("|");
}

export function summarizeSearchSubmit(results: SearchSubmitTarget[]) {
  return {
    total: results.length,
    submitted: results.filter((result) => result.status === "submitted").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    failed: results.filter((result) => result.status === "failed").length,
  };
}

export type SearchSubmitHealth = {
  ok: boolean;
  blockers: string[];
  missing: string[];
  note: "ready" | "not_ready";
  status: "ok" | "warning";
};

export type SearchSubmitAction = {
  code: string;
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export type SearchSubmitSourceInfo = {
  provider: string;
  query: {
    [key: string]: string | number | boolean | null | undefined;
  };
  source: string;
  requestedUrl: string;
  fetchedCount: number;
  normalizedCount: number;
  sampleCount: number;
  fetchedAt: string;
  fetchedAtKST: string;
};

type SearchSubmitSourceInfoInput = Omit<
  SearchSubmitSourceInfo,
  "fetchedAt" | "fetchedAtKST"
> & {
  at?: Date;
};

export function getKstDateTimeKst(date = new Date()) {
  const kst = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  const year = kst.getFullYear();
  const month = String(kst.getMonth() + 1).padStart(2, "0");
  const day = String(kst.getDate()).padStart(2, "0");
  const hour = String(kst.getHours()).padStart(2, "0");
  const minute = String(kst.getMinutes()).padStart(2, "0");
  const second = String(kst.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export function buildSearchSubmitSourceInfo(
  input: SearchSubmitSourceInfoInput,
): SearchSubmitSourceInfo {
  const at = input.at ?? new Date();

  return {
    provider: input.provider,
    query: input.query,
    source: input.source,
    requestedUrl: input.requestedUrl,
    fetchedCount: input.fetchedCount,
    normalizedCount: input.normalizedCount,
    sampleCount: input.sampleCount,
    fetchedAt: at.toISOString(),
    fetchedAtKST: getKstDateTimeKst(at),
  };
}

export function evaluateSearchSubmitHealth(
  readiness: SearchSubmitReadiness,
  summary: ReturnType<typeof summarizeSearchSubmit>,
): SearchSubmitHealth {
  const missing = [];

  if (!readiness.googleSitemap.ready) {
    missing.push("gsc_service_account");
  }

  if (!readiness.indexNow.ready) {
    missing.push("indexnow_key");
  }

  if (readiness.naverIndexNow.enabled && !readiness.naverIndexNow.ready) {
    missing.push("naver_indexnow_key");
  }

  const blockers = summary.failed > 0 ? ["submission_failed"] : [];

  return {
    ok: summary.failed === 0 && missing.length === 0,
    blockers,
    missing,
    note: missing.length === 0 && summary.failed === 0 ? "ready" : "not_ready",
    status: missing.length === 0 && summary.failed === 0 ? "ok" : "warning",
  };
}

export function formatSearchSubmitHealthMessage(health: SearchSubmitHealth) {
  if (health.ok) {
    return "검색 제출 환경 및 실행 상태 정상";
  }

  const messages: string[] = [];

  if (health.blockers.includes("submission_failed")) {
    messages.push("submission_failed");
  }

  if (health.missing.includes("gsc_service_account")) {
    messages.push("Google Search Console 인증 미설정(GSC_SERVICE_ACCOUNT_*)");
  }
  if (health.missing.includes("indexnow_key")) {
    messages.push("INDEXNOW_KEY 미설정");
  }
  if (health.missing.includes("naver_indexnow_key")) {
    messages.push("네이버 IndexNow KEY 미설정");
  }

  return messages.join(" | ");
}

export function requiredSearchSubmitActions(
  health: SearchSubmitHealth,
): SearchSubmitAction[] {
  if (health.ok) {
    return [];
  }

  const actions: SearchSubmitAction[] = [];

  for (const missing of health.missing) {
    if (missing === "gsc_service_account") {
      actions.push({
        code: "GSC_AUTH_MISSING",
        title: "GSC 서비스 계정 확인",
        detail:
          "GSC_SERVICE_ACCOUNT_JSON 또는 GSC_CLIENT_EMAIL/GSC_PRIVATE_KEY를 .env에 등록하세요.",
        priority: "high",
      });
    }
    if (missing === "indexnow_key") {
      actions.push({
        code: "INDEXNOW_KEY_MISSING",
        title: "IndexNow 키 등록",
        detail: "INDEXNOW_KEY 값을 환경변수에 등록하세요.",
        priority: "high",
      });
    }
    if (missing === "naver_indexnow_key") {
      actions.push({
        code: "NAVER_INDEXNOW_KEY_MISSING",
        title: "네이버 IndexNow 키 확인",
        detail:
          "네이버 전송을 사용할 경우 INDEXNOW_KEY가 동일하게 요구됩니다. (또는 네이버 플래그 비활성화)",
        priority: "medium",
      });
    }
  }

  if (health.blockers.includes("submission_failed")) {
    actions.push({
      code: "SUBMISSION_FAILED",
      title: "제출 실패 로그 점검",
      detail:
        "targets[].detail의 응답 코드/메시지를 운영 로그에서 확인하고 재시도하세요.",
      priority: "high",
    });
  }

  return actions;
}

export function getSearchSubmitHttpStatus(
  health: SearchSubmitHealth,
): 200 | 207 | 502 {
  if (health.ok) {
    return 200;
  }

  if (health.blockers.includes("submission_failed")) {
    return 502;
  }

  return 207;
}

export function getSearchSubmitRetryAfterSeconds(
  health: SearchSubmitHealth,
): number | null {
  if (health.ok) {
    return null;
  }

  if (health.blockers.includes("submission_failed")) {
    return 300;
  }

  if (health.missing.includes("gsc_service_account")) {
    return 3600;
  }

  if (
    health.missing.includes("indexnow_key") ||
    health.missing.includes("naver_indexnow_key")
  ) {
    return 1800;
  }

  return 900;
}

export function getSearchSubmitNextRetryAt(
  health: SearchSubmitHealth,
  now = new Date(),
): string | null {
  const retryAfterSeconds = getSearchSubmitRetryAfterSeconds(health);
  if (retryAfterSeconds === null) {
    return null;
  }

  const next = new Date(now.getTime() + retryAfterSeconds * 1000);
  return next.toISOString();
}

export function hashSubmitFingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 8);
}
