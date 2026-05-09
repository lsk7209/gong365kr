import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { listEventSlugsForSitemap } from "@/lib/events/query-repository";
import { getSiteUrl } from "@/lib/site";

const EVENT_SITEMAP_LIMIT = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const siteUrl = getSiteUrl();
  const eventUrls = await readEventSitemapUrls(siteUrl);

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
      url: `${siteUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    },
    ...eventUrls
  ];
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
