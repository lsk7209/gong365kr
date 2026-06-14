import { getDb } from "@/db";
import { hasRequiredEnv } from "@/lib/env";
import { listProgramSlugsForSitemap } from "@/lib/programs/query-repository";
import { getSiteName } from "@/lib/site";
import { getSeoulDate } from "@/lib/time/seoul";

export const revalidate = 21600;

const SAMPLE_LIMIT = 10;
const DEADLINE_MONTHS = 6;

export async function GET() {
  const now = getSeoulDate();
  const updatedAt = now.toISOString();
  const siteName = getSiteName();

  const programSlugs = await readProgramSlugs();

  const staticPages = [
    {
      url: "/",
      title: "창업지원사업 통합 검색",
      description:
        "창업지원사업, 정책자금, 지역별 공고와 이벤트 정보를 빠르게 검색합니다.",
    },
    {
      url: "/programs",
      title: "지원사업 공고",
      description:
        "지원사업 공고를 분야, 지역, 키워드 기준으로 정리해 확인합니다.",
    },
    {
      url: "/events",
      title: "창업 이벤트 정보",
      description:
        "교육, 설명회, 전시회 등 창업 이벤트를 일정 기준으로 확인하고 종료 행사도 기록으로 유지합니다.",
    },
    {
      url: "/regions",
      title: "지역별 창업지원금",
      description: "전국 지역별 창업지원사업을 분류해 제공합니다.",
    },
    {
      url: "/check",
      title: "자격 적합성 체크",
      description: "지원사업 신청 전 기본 체크 항목을 안내합니다.",
    },
    ...buildDeadlinePages(now),
  ];

  const programPages = programSlugs.map((row) => ({
    url: `/programs/${row.slug}`,
    title: `지원사업 공고`,
    description: "상세 신청 조건과 마감일을 확인합니다.",
  }));

  const pages = [...staticPages, ...programPages].map((p) => ({
    ...p,
    updatedAt,
  }));

  return new Response(
    JSON.stringify(
      {
        siteName,
        description:
          "창업지원사업, 정책자금, 지역별 공고와 이벤트를 검색형으로 제공하는 한국어 정보 허브",
        language: "ko",
        updatedAt,
        pages,
      },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}

async function readProgramSlugs() {
  if (!hasRequiredEnv(["TURSO_DATABASE_URL"])) {
    return [];
  }
  try {
    return await listProgramSlugsForSitemap(getDb(), SAMPLE_LIMIT);
  } catch {
    return [];
  }
}

function buildDeadlinePages(now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return Array.from({ length: DEADLINE_MONTHS }, (_, i) => {
    const d = new Date(year, month - 1 + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return {
      url: `/deadline/${y}/${m}`,
      title: `${y}년 ${d.getMonth() + 1}월 마감 창업지원 공고`,
      description: `${y}년 ${d.getMonth() + 1}월 마감 예정인 창업지원사업·정책자금 공고를 날짜순으로 확인합니다.`,
    };
  });
}
