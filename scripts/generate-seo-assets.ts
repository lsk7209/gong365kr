import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { readEventData } from "@/lib/events/page-data";
import { listEventSlugsForSitemap, listRecentEvents } from "@/lib/events/query-repository";
import { getEventArea, getEventSummary, getEventType } from "@/lib/events/display";
import { getSiteName } from "@/lib/site";
import { readProgramData } from "@/lib/programs/page-data";
import { getProgramAgency, getProgramCategory, getProgramSummary } from "@/lib/programs/display";
import { listProgramSlugsForSitemap, listRecentProgramsForFeed } from "@/lib/programs/query-repository";
import { regionRows } from "@/lib/regions";

const OUTPUT_DIR = path.resolve(process.cwd(), "public");
const PROGRAM_LIST_LIMIT = 20;
const PROGRAM_SLUG_LIMIT = 100;
const EVENT_SLUG_LIMIT = 100;
const AI_INDEX_LIMIT = 60;
const DEADLINE_MONTH_LIMIT = 6;
const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 120;

type SeoStaticPage = {
  url: string;
  title: string;
  description: string;
};

type ProgramSummary = {
  slug: string;
  title: string;
  summaryShort: string | null;
  agency: string | null;
  executor: string | null;
  categoryCode: string | null;
};

type EventSummary = {
  slug: string;
  title: string;
  summaryShort: string | null;
  areaName: string | null;
  eventType: string | null;
};

type AiIndexItem = SeoStaticPage & {
  updatedAt: string;
};

async function main() {
  const siteName = getSiteName();
  const now = new Date();
  const [programs, events, programSitemapRows, eventSitemapRows] = await Promise.all([
    readProgramData([], (db) => listRecentProgramsForFeed(db, PROGRAM_LIST_LIMIT)),
    readEventData([], (db) => listRecentEvents(db, PROGRAM_LIST_LIMIT)),
    readProgramData([], (db) => listProgramSlugsForSitemap(db, PROGRAM_SLUG_LIMIT)),
    readEventData([], (db) => listEventSlugsForSitemap(db, EVENT_SLUG_LIMIT))
  ]);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const staticPages = buildStaticPageEntries(now);
  const dynamicAiEntries: AiIndexItem[] = [
    ...programSitemapRows.map((item) => ({
      url: `/programs/${item.slug}`,
      title: "창업지원사업 공고",
      description: "창업지원사업 공고 상세 페이지입니다.",
      updatedAt: toIsoDate(item.lastModified ?? now)
    })),
    ...eventSitemapRows.map((item) => ({
      url: `/events/${item.slug}`,
      title: "창업 이벤트 정보",
      description: "창업 이벤트 상세 페이지입니다.",
      updatedAt: toIsoDate(item.lastModified ?? now)
    }))
  ];

  const aiIndex = {
    siteName,
    description: "창업지원사업, 정책자금, 지역별 공고와 이벤트를 검색형으로 제공하는 한국어 정보 허브",
    language: "ko",
    updatedAt: toIsoDate(now),
    pages: [...staticPages.map(toAiIndexItem), ...dynamicAiEntries]
      .filter((page, index, all) => all.findIndex((entry) => entry.url === page.url) === index)
      .slice(0, AI_INDEX_LIMIT)
  };

  const llms = buildLlmsTxt(siteName, now, { programs, events });
  const llmsFull = buildLlmsFullTxt(siteName, now, { programs, events });

  await Promise.all([
    writeFile(path.join(OUTPUT_DIR, "llms.txt"), llms, "utf8"),
    writeFile(path.join(OUTPUT_DIR, "llms-full.txt"), llmsFull, "utf8"),
    writeFile(path.join(OUTPUT_DIR, "ai-index.json"), `${JSON.stringify(aiIndex, null, 2)}\n`, "utf8")
  ]);

  process.stdout.write(`seo assets generated at ${toDateText(now)}\n`);
}

function toAiIndexItem(page: SeoStaticPage): AiIndexItem {
  return {
    ...page,
    updatedAt: toDateText(new Date())
  };
}

function buildStaticPageEntries(now: Date) {
  const deadlinePages = createDeadlinePaths(now, DEADLINE_MONTH_LIMIT).map((deadlinePath) => ({
    url: deadlinePath,
    title: "마감 임박 공고",
    description: "신규 공고와 마감일이 가까운 항목을 월 단위로 확인합니다."
  }));

  return [
    {
      url: "/",
      title: "창업지원사업 통합 검색",
      description: "창업지원사업, 정책자금, 지역별 공고와 이벤트 정보를 빠르게 검색합니다."
    },
    {
      url: "/programs",
      title: "지원사업 공고",
      description: "지원사업 공고를 분야, 지역, 키워드 기준으로 정리해 확인합니다."
    },
    {
      url: "/events",
      title: "창업 이벤트 정보",
      description: "교육, 설명회, 전시회 등 창업 이벤트를 일정 기준으로 확인합니다."
    },
    {
      url: "/regions",
      title: "지역별 창업지원금",
      description: "전국 지역별 창업지원사업을 분류해 제공합니다."
    },
    {
      url: "/check",
      title: "자격 적합성 체크",
      description: "지원사업 신청 전 기본 체크 항목을 안내합니다."
    },
    ...deadlinePages
  ].map((page) => ({
    ...page,
    title: truncateForSeo(page.title, SEO_TITLE_MAX),
    description: truncateForSeo(page.description, SEO_DESCRIPTION_MAX)
  }));
}

function buildLlmsTxt(siteName: string, updatedAt: Date, data: { programs: ProgramSummary[]; events: EventSummary[] }) {
  const period = `업데이트: ${toDateText(updatedAt)}`;
  const programCount = data.programs.length;
  const eventCount = data.events.length;
  const totalRegions = regionRows.length;
  const [currentDeadlinePath] = createDeadlinePaths(updatedAt, 1);

  return `# ${siteName}
${period}

## 핵심 카테고리
- 지원사업 공고: /programs (${programCount}건 샘플)
- 이벤트 정보: /events (${eventCount}건 샘플)
- 지역별 목록: /regions (${totalRegions}개)
- 마감 임박: ${currentDeadlinePath}
- 적합성 가이드: /check

## 제출 채널
- sitemap.xml: /sitemap.xml
- RSS: /feed.xml
- llms: /llms.txt
- llms-full: /llms-full.txt
- ai-index: /ai-index.json
`;
}

function buildLlmsFullTxt(siteName: string, updatedAt: Date, data: { programs: ProgramSummary[]; events: EventSummary[] }) {
  return `# ${siteName} - llms-full
생성일: ${toDateText(updatedAt)}

## 사이트 개요
지원사업 공고, 지역별 통계, 이벤트 일정을 정리하고 신청 판단까지 이어지는 구조로 구성되어 있습니다.

## /
1. 주요 카테고리 진입
2. 마감 임박 및 활성 공고 탐색
3. 지역별, 분야별 이동

## /programs
- 정의: 지원사업 공고 검색형 목록
- 필터: q(검색어), category(분야), region(지역)
- 핵심 체크: 마감일, 기관, 상태, 유효성
${buildRecentProgramSection(data.programs)}

## /events
- 정의: 창업 행사와 설명회 목록
- 필터: 지역, 유형, 검색어
- 핵심 체크: 행사 기간, 접수 기간, 출처
${buildRecentEventSection(data.events)}

## /regions
- 지역 코드 목록과 공고 수를 기준으로 진입
- 지역별 상세 링크: /regions/{code}
`;
}

function buildRecentProgramSection(programs: ProgramSummary[]) {
  if (programs.length === 0) {
    return "최신 등록 지원사업 데이터가 아직 없습니다.";
  }

  const items = programs
    .map((program) => {
      const summary = getProgramSummary(program);
      const info = `${getProgramCategory(program)} / ${getProgramAgency(program)}`;

      return `- ${sanitizeLine(program.title)} (${info}) - ${sanitizeLine(summary)}`;
    })
    .join("\n");

  return `### 최근 지원사업 샘플\n${items}`;
}

function buildRecentEventSection(events: EventSummary[]) {
  if (events.length === 0) {
    return "최신 등록 이벤트 데이터가 아직 없습니다.";
  }

  const items = events
    .map((event) => {
      const summary = getEventSummary(event);
      const type = getEventType(event);
      const area = getEventArea(event);

      return `- ${sanitizeLine(event.title)} (${type} / ${area}) - ${sanitizeLine(summary)}`;
    })
    .join("\n");

  return `### 최근 이벤트 샘플\n${items}`;
}

function sanitizeLine(value: string) {
  return value.replace(/\r?\n/g, " ").trim().replaceAll("|", "/");
}

function truncateForSeo(value: string, maxLength: number) {
  const normalized = value.trim();

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function getSeoulNow(referenceDate: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul"
  });
  const [year, month, day] = formatter.format(referenceDate).split("-");

  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
}

function createDeadlinePaths(referenceDate: Date, monthCount: number) {
  const now = getSeoulNow(referenceDate);
  const year = now.getFullYear();
  const month = now.getMonth();

  return Array.from({ length: monthCount }, (_, index) => {
    const target = new Date(year, month + index, 1);

    return `/deadline/${target.getFullYear()}/${String(target.getMonth() + 1).padStart(2, "0")}`;
  });
}

function toDateText(date: Date) {
  return `${date.toLocaleDateString("ko-KR")} ${date.toLocaleTimeString("ko-KR", { hour12: false })}`;
}

function toIsoDate(date: Date) {
  return date.toISOString();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`generate-seo-assets failed: ${message}\n`);
  process.exitCode = 1;
});
