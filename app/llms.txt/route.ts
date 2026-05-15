import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { listEventSlugsForSitemap } from "@/lib/events/query-repository";
import { listProgramSlugsForSitemap } from "@/lib/programs/query-repository";
import { getSiteName } from "@/lib/site";
import { getSeoulDate } from "@/lib/time/seoul";

export const revalidate = 3600;

const SITEMAP_LIMIT = 9999;

export async function GET() {
  const now = getSeoulDate();
  const [programCount, eventCount] = await readCounts();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const updatedAt = formatKstDateTime(now);

  const text = [
    `# ${getSiteName()}`,
    `업데이트: ${updatedAt}`,
    ``,
    `## 핵심 카테고리`,
    `- 지원사업 공고: /programs (${programCount}건)`,
    `- 이벤트 정보: /events (${eventCount}건, 종료 행사 포함)`,
    `- 지역별 목록: /regions (17개)`,
    `- 마감 임박: /deadline/${year}/${month}`,
    `- 적합성 가이드: /check`,
    ``,
    `## 제출 채널`,
    `- sitemap.xml: /sitemap.xml`,
    `- RSS: /feed.xml`,
    `- llms: /llms.txt`,
    `- llms-full: /llms-full.txt`,
    `- ai-index: /ai-index.json`,
  ].join("\n");

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function readCounts(): Promise<[number, number]> {
  if (!hasRequiredEnv(["TURSO_DATABASE_URL"])) {
    return [0, 0];
  }
  try {
    const db = getDb();
    const [programs, events] = await Promise.all([
      listProgramSlugsForSitemap(db, SITEMAP_LIMIT),
      listEventSlugsForSitemap(db, SITEMAP_LIMIT),
    ]);
    return [programs.length, events.length];
  } catch {
    return [0, 0];
  }
}

function formatKstDateTime(date: Date) {
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}. ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`;
}
