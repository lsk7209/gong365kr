import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { getEventSummary, type EventListItem } from "@/lib/events/display";
import { listRecentEvents } from "@/lib/events/query-repository";
import { getProgramSummary, type ProgramListItem } from "@/lib/programs/display";
import { listRecentProgramsForFeed } from "@/lib/programs/query-repository";
import { getSiteName, getSiteUrl } from "@/lib/site";

const FEED_LIMIT = 50;
const FEED_REVALIDATE_SECONDS = 3600;

export const revalidate = 3600;

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
  const feedItems = [
    ...input.programs.map((program) => createProgramFeedItem(program, input.siteUrl)),
    ...input.events.map((event) => createEventFeedItem(event, input.siteUrl))
  ];
  const items =
    feedItems.length > 0
      ? feedItems.join("")
      : createDefaultFeedItem(input.siteName, input.siteUrl, now);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(input.siteName)}</title>
    <link>${escapeXml(input.siteUrl)}</link>
    <description>창업지원사업, 정책자금, 지자체 보조금 최신 공고 모음</description>
    <language>ko-KR</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

function createEventFeedItem(event: EventListItem, siteUrl: string) {
  const link = `${siteUrl}/events/${event.slug}`;
  const pubDate = event.createdAt ?? event.eventStart ?? new Date();

  return `
    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(getEventSummary(event))}</description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(event.eventType ?? "행사정보")}</category>
    </item>`;
}

function createProgramFeedItem(program: ProgramListItem, siteUrl: string) {
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
    </item>`;
}

function createDefaultFeedItem(siteName: string, siteUrl: string, pubDate: Date) {
  return `
    <item>
      <title>${escapeXml(`${siteName} 창업지원금 공고 모음`)}</title>
      <link>${escapeXml(siteUrl)}</link>
      <guid isPermaLink="true">${escapeXml(siteUrl)}</guid>
      <description>창업지원사업, 정책자금, 지자체 보조금을 한곳에서 확인할 수 있습니다.</description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <category>창업지원금</category>
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
