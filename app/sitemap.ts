import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { listEventSlugsForSitemap } from "@/lib/events/query-repository";
import { listProgramSlugsForSitemap } from "@/lib/programs/query-repository";
import { regionRows } from "@/lib/regions";
import { getSeoulDate } from "@/lib/time/seoul";
import { getSiteUrl } from "@/lib/site";

const EVENT_SITEMAP_LIMIT = 200;
const PROGRAM_SITEMAP_LIMIT = 500;
const DEADLINE_SITEMAP_MONTHS = 6;
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const siteUrl = getSiteUrl();
  const [programUrls, eventUrls] = await Promise.all([readProgramSitemapUrls(siteUrl), readEventSitemapUrls(siteUrl)]);
  const latestContentModified = getLatestDate([...programUrls, ...eventUrls].map((item) => item.lastModified));
  const effectiveLastModified = latestContentModified ?? now;

  return [
    {
      url: siteUrl,
      lastModified: effectiveLastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/check`,
      lastModified: effectiveLastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/regions`,
      lastModified: effectiveLastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/programs`,
      lastModified: effectiveLastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/events`,
      lastModified: effectiveLastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...readRegionSitemapUrls(siteUrl, effectiveLastModified),
    ...readDeadlineSitemapUrls(siteUrl, effectiveLastModified),
    ...programUrls,
    ...eventUrls,
  ];
}

function readDeadlineSitemapUrls(siteUrl: string, lastModified: Date): MetadataRoute.Sitemap {
  const now = getSeoulDate();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return Array.from({ length: DEADLINE_SITEMAP_MONTHS }, (_, index) => {
    const target = addMonths(year, month - 1, index);

    return {
      url: `${siteUrl}/deadline/${target.getFullYear()}/${String(target.getMonth() + 1).padStart(2, "0")}`,
      lastModified,
      changeFrequency: "weekly",
      priority: index === 0 ? 0.8 : 0.6,
    };
  });
}

function readRegionSitemapUrls(siteUrl: string, lastModified: Date): MetadataRoute.Sitemap {
  return regionRows.map((region) => ({
    url: `${siteUrl}/regions/${region.code}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.65,
  }));
}

async function readProgramSitemapUrls(siteUrl: string): Promise<MetadataRoute.Sitemap> {
  if (!hasRequiredEnv(["TURSO_DATABASE_URL"])) {
    return [];
  }

  try {
    const rows = await listProgramSlugsForSitemap(getDb(), PROGRAM_SITEMAP_LIMIT);

    return rows.map((row) => ({
      url: `${siteUrl}/programs/${row.slug}`,
      lastModified: row.lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

async function readEventSitemapUrls(siteUrl: string): Promise<MetadataRoute.Sitemap> {
  if (!hasRequiredEnv(["TURSO_DATABASE_URL"])) {
    return [];
  }

  try {
    const rows = await listEventSlugsForSitemap(getDb(), EVENT_SITEMAP_LIMIT);

    return rows.map((row) => ({
      url: `${siteUrl}/events/${row.slug}`,
      lastModified: row.lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

function addMonths(year: number, baseMonthIndex: number, offset: number) {
  return new Date(year, baseMonthIndex + offset, 1);
}

function getLatestDate(values: Array<Date | null | undefined>) {
  return values.reduce<Date | null>((acc, value) => {
    if (!value) return acc;

    return !acc || value.getTime() > acc.getTime() ? value : acc;
  }, null);
}
