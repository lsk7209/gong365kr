import { createHash, createSign } from "node:crypto";
import { getSiteUrl, normalizeSiteUrl } from "@/lib/site";
import { readEventData } from "@/lib/events/page-data";
import { listEventSlugsForSitemap } from "@/lib/events/query-repository";
import { readProgramData } from "@/lib/programs/page-data";
import { listProgramSlugsForSitemap } from "@/lib/programs/query-repository";

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
  "/sitemap.xml",
  "/feed.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/ai-index.json",
  "/robots.txt"
] as const;
const STATIC_FILE_PATHS = ["/sitemap.xml", "/robots.txt", "/feed.xml", "/llms.txt", "/llms-full.txt", "/ai-index.json"] as const;

type SubmissionResult = {
  target: string;
  status: "submitted" | "skipped" | "failed";
  detail: string;
};

type ServiceAccountInput = {
  clientEmail: string;
  privateKey: string;
};

async function main() {
  const siteUrl = getSearchSiteUrl();
  const urls = await createSubmissionUrls(siteUrl);
  const targets: Promise<SubmissionResult>[] = [submitGoogleSitemap(siteUrl), submitIndexNow(siteUrl, urls, INDEXNOW_ENDPOINT, "indexnow")];

  if (process.env.ENABLE_NAVER_INDEXNOW === "true" || process.env.SUBMIT_NAVER_INDEXNOW === "true") {
    targets.push(submitIndexNow(siteUrl, urls, NAVER_INDEXNOW_ENDPOINT, "indexnow-naver"));
  }

  const results = await Promise.all(targets);

  for (const result of results) {
    console.log(`${result.target}: ${result.status} - ${result.detail}`);
  }

  if (results.some((result) => result.status === "failed")) {
    process.exitCode = 1;
  }
}

async function submitGoogleSitemap(siteUrl: string): Promise<SubmissionResult> {
  const serviceAccount = readServiceAccount();

  if (!serviceAccount) {
    return {
      target: "google-sitemap",
      status: "skipped",
      detail: "GSC service account env is missing"
    };
  }

  const accessToken = await createGoogleAccessToken(serviceAccount);
  const propertyUrl = process.env.GSC_SITE_URL ?? siteUrl;
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    propertyUrl
  )}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    return {
      target: "google-sitemap",
      status: "failed",
      detail: `${response.status} ${await response.text()}`
    };
  }

  return {
    target: "google-sitemap",
    status: "submitted",
    detail: sitemapUrl
  };
}

async function submitIndexNow(
  siteUrl: string,
  urls: string[],
  endpoint: string,
  target: string
): Promise<SubmissionResult> {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return {
      target,
      status: "skipped",
      detail: "INDEXNOW_KEY env is missing"
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      host: new URL(siteUrl).host,
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: urls
    })
  });

  if (!response.ok && response.status !== 202) {
    return {
      target,
      status: "failed",
      detail: `${response.status} ${await response.text()}`
    };
  }

  return {
    target,
    status: "submitted",
    detail: `${response.status} ${urls.length} urls`
  };
}

function getSearchSiteUrl() {
  return normalizeSiteUrl(process.env.SEARCH_SUBMIT_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? getSiteUrl());
}

async function createSubmissionUrls(siteUrl: string) {
  const paths = new Set<string>([...DEFAULT_URL_PATHS, ...createDeadlinePaths(), ...STATIC_FILE_PATHS]);
  const [programRows, eventRows] = await Promise.all([
    readProgramData([], (db) => listProgramSlugsForSitemap(db, SITEMAP_PROGRAM_LIMIT)),
    readEventData([], (db) => listEventSlugsForSitemap(db, SITEMAP_EVENT_LIMIT))
  ]);

  for (const row of programRows.slice(0, SUBMISSION_PROGRAM_LIMIT)) {
    paths.add(`/programs/${row.slug}`);
  }

  for (const row of eventRows.slice(0, SUBMISSION_EVENT_LIMIT)) {
    paths.add(`/events/${row.slug}`);
  }

  return Array.from(paths).map((path) => `${siteUrl}${path === "/" ? "" : path}`);
}

function createDeadlinePaths() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
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
      const parsed = JSON.parse(rawJson) as { client_email?: string; private_key?: string };

      if (parsed.client_email && parsed.private_key) {
        return {
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key
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
    privateKey: process.env.GSC_PRIVATE_KEY.replace(/\\n/g, "\n")
  };
}

async function createGoogleAccessToken(input: ServiceAccountInput) {
  const now = Math.floor(Date.now() / 1000);
  const jwt = signJwt(
    {
      alg: "RS256",
      typ: "JWT"
    },
    {
      iss: input.clientEmail,
      scope: GOOGLE_SITEMAP_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now
    },
    input.privateKey
  );
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status} ${await response.text()}`);
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
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(privateKey);

  return `${unsignedToken}.${base64Url(signature)}`;
}

function base64Url(input: string | Buffer) {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;

  return buffer.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

main().catch((error) => {
  const fingerprint = createHash("sha256").update(error instanceof Error ? error.message : String(error)).digest("hex").slice(0, 8);
  console.error(`submit-search-index failed (${fingerprint}):`, error instanceof Error ? error.message : error);
  process.exit(1);
});
