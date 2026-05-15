import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { listRecentEvents } from "@/lib/events/query-repository";
import { listEventSlugsForSitemap } from "@/lib/events/query-repository";
import { listRecentProgramsForFeed } from "@/lib/programs/query-repository";
import { listProgramSlugsForSitemap } from "@/lib/programs/query-repository";
import { getSiteName } from "@/lib/site";
import { getSeoulDate } from "@/lib/time/seoul";

export const revalidate = 3600;

const FEED_LIMIT = 20;
const COUNT_LIMIT = 9999;

export async function GET() {
  const now = getSeoulDate();
  const updatedAt = formatKstDateTime(now);

  const [programs, events, programCount, eventCount] = await readData();

  const lines: string[] = [
    `# ${getSiteName()} - llms-full`,
    `생성일: ${updatedAt}`,
    ``,
    `## 사이트 개요`,
    `지원사업 공고, 지역별 통계, 이벤트 일정을 정리하고 신청 판단까지 이어지는 구조로 구성되어 있습니다.`,
    ``,
    `## /`,
    `1. 주요 카테고리 진입`,
    `2. 마감 임박 및 활성 공고 탐색`,
    `3. 지역별, 분야별 이동`,
    ``,
    `## /programs`,
    `- 정의: 지원사업 공고 검색형 목록`,
    `- 필터: q(검색어), category(분야), region(지역)`,
    `- 핵심 체크: 마감일, 기관, 상태, 유효성`,
  ];

  if (programs.length > 0) {
    lines.push(`- 총 ${programCount}건 수록`, `- 최근 등록:`);
    for (const p of programs) {
      const end = p.applicationEnd ? ` (~${formatDate(p.applicationEnd)})` : "";
      lines.push(`  - [${p.title}](/programs/${p.slug})${end}`);
    }
  } else {
    lines.push(`최신 등록 지원사업 데이터가 아직 없습니다.`);
  }

  lines.push(``, `## /events`);
  lines.push(
    `- 정의: 창업 행사와 설명회 목록`,
    `- 필터: 지역, 유형, 검색어`,
    `- 핵심 체크: 행사 기간, 접수 기간, 출처, 종료 여부`,
    `- 종료된 행사도 URL을 유지해 이전 조건 확인과 검색 노출에 사용`,
  );

  if (events.length > 0) {
    lines.push(`- 총 ${eventCount}건 수록`, `- 최근 등록:`);
    for (const e of events) {
      const start = e.eventStart ? ` (${formatDate(e.eventStart)})` : "";
      lines.push(`  - [${e.title}](/events/${e.slug})${start}`);
    }
  } else {
    lines.push(`최신 등록 이벤트 데이터가 아직 없습니다.`);
  }

  lines.push(
    ``,
    `## /regions`,
    `- 지역 코드 목록과 공고 수를 기준으로 진입`,
    `- 지역별 상세 링크: /regions/{code}`,
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function readData(): Promise<
  [
    Awaited<ReturnType<typeof listRecentProgramsForFeed>>,
    Awaited<ReturnType<typeof listRecentEvents>>,
    number,
    number,
  ]
> {
  if (!hasRequiredEnv(["TURSO_DATABASE_URL"])) {
    return [[], [], 0, 0];
  }
  try {
    const db = getDb();
    const [programs, events, programSlugs, eventSlugs] = await Promise.all([
      listRecentProgramsForFeed(db, FEED_LIMIT),
      listRecentEvents(db, FEED_LIMIT),
      listProgramSlugsForSitemap(db, COUNT_LIMIT),
      listEventSlugsForSitemap(db, COUNT_LIMIT),
    ]);
    return [programs, events, programSlugs.length, eventSlugs.length];
  } catch {
    return [[], [], 0, 0];
  }
}

function formatDate(date: Date) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function formatKstDateTime(date: Date) {
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}. ${date.getHours()}시 ${date.getMinutes()}분 ${date.getSeconds()}초`;
}
