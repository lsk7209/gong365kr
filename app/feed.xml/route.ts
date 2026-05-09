import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { formatDate, getProgramSummary, type ProgramListItem } from "@/lib/programs/display";
import { listRecentProgramsForFeed } from "@/lib/programs/query-repository";
import { getSiteName, getSiteUrl } from "@/lib/site";

const FEED_LIMIT = 50;
const FEED_REVALIDATE_SECONDS = 3600;

export const revalidate = 3600;

export async function GET() {
  const siteUrl = getSiteUrl();
  const programs = await readFeedPrograms();
  const xml = createFeedXml({
    siteName: getSiteName(),
    siteUrl,
    programs
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${FEED_REVALIDATE_SECONDS}`
    }
  });
}

async function readFeedPrograms() {
  if (!hasRequiredEnv(["TURSO_DATABASE_URL"])) {
    return [];
  }

  try {
    return await listRecentProgramsForFeed(getDb(), FEED_LIMIT);
  } catch {
    return [];
  }
}

function createFeedXml(input: { siteName: string; siteUrl: string; programs: ProgramListItem[] }) {
  const now = new Date();
  const items = input.programs.map((program) => createFeedItem(program, input.siteUrl)).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(input.siteName)}</title>
    <link>${escapeXml(input.siteUrl)}</link>
    <description>창업지원사업, 정책자금, 지자체 보조금 최신 공고 모음</description>
    <language>ko-KR</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${input.siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

function createFeedItem(program: ProgramListItem, siteUrl: string) {
  const link = `${siteUrl}/programs/${program.slug}`;
  const pubDate = program.applicationStart ?? program.applicationEnd ?? new Date();

  return `
    <item>
      <title>${escapeXml(program.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(getProgramSummary(program))}</description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(program.categoryCode ?? "지원사업")}</category>
      <source url="${escapeXml(program.rawUrl)}">원공고</source>
      <comments>마감 ${escapeXml(formatDate(program.applicationEnd))}</comments>
    </item>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
