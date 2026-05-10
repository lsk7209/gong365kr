import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { listEventSlugsForSitemap } from "@/lib/events/query-repository";
import { listProgramSlugsForSitemap } from "@/lib/programs/query-repository";
import { getSiteUrl } from "@/lib/site";

const EVENT_SITEMAP_LIMIT = 200;
const PROGRAM_SITEMAP_LIMIT = 500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const siteUrl = getSiteUrl();
  const [programUrls, eventUrls] = await Promise.all([readProgramSitemapUrls(siteUrl), readEventSitemapUrls(siteUrl)]);

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/check`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/regions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7
    },
    {
      url: `${siteUrl}/programs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    },
    ...programUrls,
    ...eventUrls
  ];
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
      priority: 0.7
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
      priority: 0.6
    }));
  } catch {
    return [];
  }
}
