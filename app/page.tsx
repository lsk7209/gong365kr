import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { EmptyState } from "./_components/empty-state";
import { EventCard } from "./_components/event-card";
import { ProgramCard } from "./_components/program-card";
import { readEventData } from "@/lib/events/page-data";
import { listUpcomingEvents } from "@/lib/events/query-repository";
import { readProgramData } from "@/lib/programs/page-data";
import {
  countActiveProgramsByCategory,
  countProgramsByRegions,
  listClosedPrograms,
  listOpenPrograms,
} from "@/lib/programs/query-repository";
import { regionRows } from "@/lib/regions";
import { getSiteName, getSiteUrl } from "@/lib/site";
import { getSeoulDate } from "@/lib/time/seoul";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "창업머니맵 - 지원사업 공고를 한 번에 확인",
  description:
    "창업지원사업, 정책자금, 지역별 공고와 마감 임박 정보를 한 화면에서 확인합니다. 신청 체크와 원문 공고 이동까지 빠르게 연결합니다.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "창업머니맵 - 지원사업 공고를 한 번에 확인",
    description:
      "창업지원사업, 정책자금, 지역별 공고와 마감 임박 정보를 한 화면에서 확인합니다.",
    type: "website",
    locale: "ko_KR",
  },
};

const HOME_PROGRAM_LIMIT = 3;
const HOME_EVENT_LIMIT = 3;
const HOME_CATEGORY_LIMIT = 4;
const HOME_CLOSED_PROGRAM_LIMIT = 3;

export default async function HomePage() {
  const [
    openPrograms,
    closedPrograms,
    upcomingEvents,
    categoryRows,
    regionCounts,
  ] = await Promise.all([
    readProgramData([], (db) =>
      listOpenPrograms(db, HOME_PROGRAM_LIMIT, {}, new Date()),
    ),
    readProgramData([], (db) =>
      listClosedPrograms(db, HOME_CLOSED_PROGRAM_LIMIT, {}, new Date()),
    ),
    readEventData([], (db) => listUpcomingEvents(db, HOME_EVENT_LIMIT)),
    readProgramData([], (db) =>
      countActiveProgramsByCategory(db, HOME_CATEGORY_LIMIT),
    ),
    readProgramData([], (db) => countProgramsByRegions(db, regionRows)),
  ]);

  const latestDeadlineUrl = createDeadlineHref(
    openPrograms[0]?.applicationEnd ?? new Date(),
  );
  const regionCountMap = new Map(
    regionCounts.map((item) => [item.code, item.count]),
  );
  const totalPrograms = regionRows.reduce(
    (sum, item) => sum + (regionCountMap.get(item.code) ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-white">
      <HomeJsonLd />
      <section className="bg-[#0a0b0d] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-20">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#16181c] px-4 py-2 text-xs font-semibold text-slate-300">
              <ShieldCheck size={14} aria-hidden />
              마감 공고는 숨기지 않고 기록으로 유지
            </p>
            <h1 className="max-w-3xl text-4xl font-normal leading-tight tracking-tight sm:text-6xl">
              창업지원사업 공고를 한 화면에서 비교하세요
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              진행 중인 공고를 먼저 보여주고, 마감된 공고도 삭제하지 않아 이전
              모집 조건과 다음 모집 가능성을 함께 확인할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/programs"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
              >
                <Search size={18} aria-hidden />
                공고 검색
              </Link>
              <Link
                href="/check"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#16181c] px-5 py-3 text-sm font-semibold text-white"
              >
                신청 체크
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl bg-[#16181c] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-semibold">지원사업 대시보드</h2>
                <p className="mt-1 text-sm text-slate-400">
                  지역·분야별 공고 집계
                </p>
              </div>
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                Live
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              <MetricRow label="지역 기준 공고" value={`${totalPrograms}개`} />
              {categoryRows.length > 0 ? (
                categoryRows.map((item) => (
                  <MetricRow
                    key={item.label}
                    label={item.label}
                    value={`${item.count}개`}
                  />
                ))
              ) : (
                <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
                  카테고리 데이터 동기화 대기 중
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
        <FeatureCard
          title="진행 중 공고 우선"
          description="접수 가능한 공고를 먼저 정렬하고, 마감된 공고는 하단에 기록으로 유지합니다."
        />
        <FeatureCard
          title="지역별 탐색"
          description="전국 지역 키워드를 기준으로 공고를 묶어 관심 지역만 빠르게 확인할 수 있습니다."
        />
        <FeatureCard
          title="신청 전 점검"
          description="자격, 서류, 접수 기간을 원문 공고 기준으로 확인하도록 동선을 연결했습니다."
        />
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-normal tracking-tight text-ink">
                마감 임박 지원사업
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                오늘 기준 신청 가능한 공고를 마감일 가까운 순서로 보여줍니다.
              </p>
            </div>
            <Link
              href={latestDeadlineUrl}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
            >
              전체 보기
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          {openPrograms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {openPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="마감 임박 지원사업 데이터 없음"
              description="현재 표시할 데이터가 없습니다. 동기화 후 자동으로 반영됩니다."
            />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-normal tracking-tight text-ink">
              마감된 공고
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              마감된 공고는 별도 보관되어 조회를 유지합니다.
            </p>
          </div>
        </div>
        {closedPrograms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {closedPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="현재 마감된 공고가 없습니다"
            description="마감된 공고 내역이 없습니다. 오픈 공고가 활성화되면 자동 갱신됩니다."
          />
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-normal tracking-tight text-ink">
              다가오는 행사
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              교육, 설명회, 전시 일정을 일정순으로 확인하세요.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
          >
            이벤트 전체 보기
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="등록된 행사 데이터 없음"
            description="공개 행사 항목이 동기화되면 자동으로 반영됩니다."
          />
        )}
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            <h2 className="text-2xl font-normal tracking-tight text-ink">
              지역별 지원사업 수
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              지역별 집계를 비교해 관심 지역의 공고를 바로 확인하세요.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {regionRows.map((region) => (
              <Link
                key={region.code}
                href={`/regions/${region.code}`}
                className="rounded-3xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-panel"
              >
                <div className="text-sm text-slate-500">{region.group}</div>
                <strong className="mt-1 block text-lg font-semibold text-ink">
                  {region.name}
                </strong>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  <TrendingUp size={14} aria-hidden />
                  {regionCountMap.get(region.code) ?? 0}개
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl bg-[#0a0b0d] p-8 text-white md:p-12">
          <CalendarClock className="text-brand" size={28} aria-hidden />
          <h2 className="mt-4 max-w-2xl text-3xl font-normal tracking-tight">
            마감된 공고도 검색 노출을 위해 유지합니다
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            신청이 끝난 공고는 삭제하지 않고 `마감` 상태로 표시합니다. 이전 모집
            조건을 참고할 수 있고, 검색엔진에는 URL과 문맥이 유지됩니다.
          </p>
        </div>
      </section>
    </main>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="font-mono text-lg font-medium text-white">{value}</span>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}

function createDeadlineHref(date: Date) {
  const fallback = getSeoulDate(date);
  const year = fallback.getFullYear();
  const month = String(fallback.getMonth() + 1).padStart(2, "0");

  return `/deadline/${year}/${month}`;
}

function HomeJsonLd() {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/programs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
    </>
  );
}
