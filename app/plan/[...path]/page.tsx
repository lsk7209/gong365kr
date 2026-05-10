import { redirect } from "next/navigation";
import { getSeoulDate } from "@/lib/time/seoul";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type PlanCompatPageProps = {
  params: Promise<{
    path?: string[];
  }>;
  searchParams: Promise<SearchParams>;
};

const PLAN_BASE_PATHS = ["programs", "events", "regions", "check", "deadline"] as const;

const PLAN_STATIC_FILES = {
  "sitemap.xml": "/sitemap.xml",
  "sitemap": "/sitemap.xml",
  "sitemap_index.xml": "/sitemap.xml",
  "sitemaps.xml": "/sitemap.xml",
  "rss.xml": "/feed.xml",
  "feed.xml": "/feed.xml",
  "feed": "/feed.xml",
  "robots.txt": "/robots.txt",
  "robots": "/robots.txt",
  "llms.txt": "/llms.txt",
  "llms-full.txt": "/llms-full.txt",
  "ai-index.json": "/ai-index.json",
} as const;

const PLAN_STATIC_PATHS = Object.keys(PLAN_STATIC_FILES) as ReadonlyArray<keyof typeof PLAN_STATIC_FILES>;

export default async function PlanCompatPage({ params, searchParams }: PlanCompatPageProps) {
  const { path = [] } = await params;
  const query = await searchParams;
  const normalizedSegments = path
    .map((segment) => normalizeSegment(segment))
    .filter((segment) => segment.length > 0);

  if (normalizedSegments.length === 0) {
    redirect("/programs");
  }

  const normalizedFullPath = normalizedSegments.join("/");
  const firstSegment = normalizedSegments[0];

  const staticDestination = PLAN_STATIC_FILES[normalizedFullPath as keyof typeof PLAN_STATIC_FILES];
  if (staticDestination) {
    redirect(appendSearchParams(staticDestination, query));
  }

  if (firstSegment === "deadline") {
    if (normalizedSegments.length === 1) {
      redirect(appendSearchParams(createCurrentDeadlineHref(), query));
    }

    const year = normalizedSegments[1];
    const month = normalizedSegments[2];
    if (isDeadlineMonthPair(year, month)) {
      redirect(appendSearchParams(`/deadline/${year}/${month}`, query));
    }

    redirect(appendSearchParams(createCurrentDeadlineHref(), query));
  }

  const fileLikeDestination = PLAN_STATIC_PATHS.find((path) => {
    return path === normalizedFullPath || normalizedFullPath.startsWith(`${path}/`);
  });
  if (fileLikeDestination) {
    redirect(appendSearchParams(PLAN_STATIC_FILES[fileLikeDestination], query));
  }

  const normalizedPath = normalizedSegments.join("/");
  const hasKnownBasePath = PLAN_BASE_PATHS.includes(firstSegment as (typeof PLAN_BASE_PATHS)[number]);

  if (hasKnownBasePath) {
    redirect(appendSearchParams(`/${normalizedPath}`, query));
  }

  redirect(appendSearchParams(`/programs/${encodeURIComponent(normalizedSegments[normalizedSegments.length - 1])}`, query));
}

function normalizeSegment(raw: string) {
  try {
    return decodeURIComponent(raw).toLowerCase().trim();
  } catch {
    return raw.toLowerCase().trim();
  }
}

function isDeadlineMonthPair(year: string, month?: string) {
  if (!year || !month) {
    return false;
  }

  const normalizedMonth = month.padStart(2, "0");
  const monthNumber = Number(normalizedMonth);

  return /^\d{4}$/.test(year) && /^\d{2}$/.test(normalizedMonth) && monthNumber >= 1 && monthNumber <= 12;
}

function appendSearchParams(basePath: string, searchParams: SearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item.trim()) {
          params.append(key, item);
        }
      }
      continue;
    }

    if (String(value).trim()) {
      params.set(key, String(value));
    }
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

function createCurrentDeadlineHref() {
  const now = getSeoulDate();
  return `/deadline/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
}
