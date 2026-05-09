import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "OAI-SearchBot", "Google-Extended", "Yeti", "Daumoa"],
        allow: "/"
      },
      {
        userAgent: "Bytespider",
        disallow: "/"
      },
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
