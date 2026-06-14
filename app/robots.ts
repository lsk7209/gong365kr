import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// 봇이 쿼리파라미터 조합(?keyword=, ?page= 등)과 API를 무한 크롤하면
// Turso reads가 폭주하므로 차단 (정적 콘텐츠 경로는 그대로 허용)
const CRAWL_BLOCK = ["/*?", "/api/"];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "OAI-SearchBot",
          "Google-Extended",
          "Yeti",
          "Daumoa",
          "AnthropicAI",
          "anthropic-ai",
        ],
        allow: "/",
        disallow: CRAWL_BLOCK,
      },
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: CRAWL_BLOCK,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
