import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { getEventSummary, type EventListItem } from "@/lib/events/display";
import { listRecentEvents } from "@/lib/events/query-repository";
import { getProgramSummary, type ProgramListItem } from "@/lib/programs/display";
import { listRecentProgramsForFeed } from "@/lib/programs/query-repository";
import { getSiteName, getSiteUrl } from "@/lib/site";

type FeedItem = {
  xml: string;
  publishedAt: Date;
};

const FEED_LIMIT = 50;
const FEED_REVALIDATE_SECONDS = 21600;

export const revalidate = 21600;

export async function GET() {
  const siteUrl = getSiteUrl();
  const [programs, events] = await Promise.all([readFeedPrograms(), readFeedEvents()]);
  const xml = createFeedXml({
    siteName: getSiteName(),
    siteUrl,
    programs,
    events
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${FEED_REVALIDATE_SECONDS}`
    }
  });
}

async function readFeedEvents() {
  if (!hasRequiredEnv(["TURSO_DATABASE_URL"])) {
    return [];
  }

  try {
    return await listRecentEvents(getDb(), FEED_LIMIT);
  } catch {
    return [];
  }
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

function createFeedXml(input: { siteName: string; siteUrl: string; programs: ProgramListItem[]; events: EventListItem[] }) {
  const now = new Date();
  const feedItems: FeedItem[] = [
    ...input.programs.map((program) => createProgramFeedItem(program, input.siteUrl)),
    ...input.events.map((event) => createEventFeedItem(event, input.siteUrl))
  ].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const items =
    feedItems.length > 0
      ? feedItems.map((item) => item.xml).join("")
      : createDefaultFeedItem(input.siteName, input.siteUrl, now);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(input.siteName)}</title>
    <link>${escapeXml(input.siteUrl)}</link>
    <description>창업지원사업 공고와 행사 정보를 최신 순으로 제공하는 RSS 피드입니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

function createEventFeedItem(event: EventListItem, siteUrl: string): FeedItem {
  const link = `${siteUrl}/events/${event.slug}`;
  const pubDate = event.createdAt ?? event.eventStart ?? new Date();

  return {
    xml: `
    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(getEventSummary(event))}</description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(event.eventType ?? "행사")}</category>
    </item>`,
    publishedAt: pubDate
  };
}

function createProgramFeedItem(program: ProgramListItem, siteUrl: string): FeedItem {
  const link = `${siteUrl}/programs/${program.slug}`;
  const pubDate = program.applicationStart ?? program.applicationEnd ?? new Date();

  return {
    xml: `
    <item>
      <title>${escapeXml(program.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(getProgramSummary(program))}</description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(program.categoryCode ?? "정책자금")}</category>
    </item>`,
    publishedAt: pubDate
  };
}

function createDefaultFeedItem(siteName: string, siteUrl: string, pubDate: Date) {
  return `
    <item>
      <title>${escapeXml(`${siteName} 지원사업 최신 공지`)}</title>
      <link>${escapeXml(siteUrl)}</link>
      <guid isPermaLink="true">${escapeXml(siteUrl)}</guid>
      <description>창업지원사업·행사 공고와 마감 정보를 최신 상태로 확인하세요.</description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category>지원사업</category>
    </item>`;
}

function escapeXml(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
