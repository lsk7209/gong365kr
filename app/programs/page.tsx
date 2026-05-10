import { Search, WalletCards } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/app/_components/empty-state";
import { ProgramCard } from "@/app/_components/program-card";
import { readProgramData } from "@/lib/programs/page-data";
import {
  countActiveProgramsByCategory,
  countProgramsByRegions,
  listClosedPrograms,
  listActivePrograms,
  type ProgramFilterInput
} from "@/lib/programs/query-repository";
import { findRegionByCode, regionRows } from "@/lib/regions";

export const revalidate = 3600;
const PROGRAMS_PAGE_LIMIT = 50;
const PROGRAMS_CLOSED_PAGE_LIMIT = 30;
const CATEGORY_FACET_LIMIT = 20;
const MAX_KEYWORD_LENGTH = 40;

type ProgramsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    region?: string | string[];
  }>;
};

type ProgramFilters = ProgramFilterInput;

export const metadata = {
  title: "창업 공고",
  description: "진행 중인 공고를 우선 보여주고, 마감된 공고도 삭제 없이 기록으로 남겨 과거 공고도 확인할 수 있습니다.",
  alternates: {
    canonical: "/programs"
  },
  openGraph: {
    title: "창업 공고",
    description: "창업 지원금, 보조금, 정책 공고를 신청 시기별로 확인하고, 마감 공고도 기록으로 조회할 수 있습니다.",
    locale: "ko_KR",
    type: "website"
  }
};

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const filters = await parseProgramFilters(searchParams);
  const [programs, closedPrograms, categoryFacets, regionFacets] = await Promise.all([
    readProgramData([], (db) => listActivePrograms(db, PROGRAMS_PAGE_LIMIT, filters)),
    readProgramData([], (db) => listClosedPrograms(db, PROGRAMS_CLOSED_PAGE_LIMIT, filters)),
    readProgramData([], (db) => countActiveProgramsByCategory(db, CATEGORY_FACET_LIMIT)),
    readProgramData([], (db) => countProgramsByRegions(db, regionRows))
  ]);
  const activePrograms = programs;
  const hasActiveFilters = Boolean(filters.keyword || filters.categoryCode || filters.region);
  const selectedRegionCode = filters.region?.code;

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <header className="rounded-lg border border-line bg-slate-50 p-6">
          <WalletCards className="text-signal" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-bold text-ink">창업 공고</h1>
          <p className="mt-3 leading-7 text-slate-600">
            진행 중인 창업지원사업을 우선 보여주고, 마감된 공고도 기록으로 남겨 과거 공고 내역까지 확인할 수 있습니다.
          </p>
        </header>

        <section className="mt-6 border-y border-line py-5" aria-label="공고 검색 필터">
          <SearchForm filters={filters} />
          <div className="mt-5">
            <div className="mb-2 text-sm font-bold text-ink">카테고리</div>
            <div className="flex flex-wrap gap-2">
              <FilterLink label="전체" href={createProgramHref({ ...filters, categoryCode: undefined })} active={!filters.categoryCode} />
              {categoryFacets.map((facet) => (
                <FilterLink
                  key={facet.label}
                  label={`${facet.label} ${facet.count}`}
                  href={createProgramHref({ ...filters, categoryCode: facet.label })}
                  active={filters.categoryCode === facet.label}
                />
              ))}
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 text-sm font-bold text-ink">지역</div>
            <div className="flex flex-wrap gap-2">
              <FilterLink label="전체" href={createProgramHref({ ...filters, region: undefined })} active={!filters.region} />
              {regionRows.map((region) => {
                const count = regionFacets.find((facet) => facet.code === region.code)?.count ?? 0;

                return (
                  <FilterLink
                    key={region.code}
                    label={`${region.name} ${count}`}
                    href={createProgramHref({ ...filters, region })}
                    active={selectedRegionCode === region.code}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>{activePrograms.length + closedPrograms.length}개 공고</span>
            {hasActiveFilters ? (
              <Link href="/programs" className="font-semibold text-brand">
                전체 초기화
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mt-6">
          <section aria-label="진행 중 공고">
            <h2 className="text-lg font-semibold text-ink">진행 중</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {activePrograms.length > 0 ? (
                activePrograms.map((program) => <ProgramCard key={program.id} program={program} />)
              ) : (
                <EmptyState title="진행 중 공고 없음" description="현재 조건에 맞는 진행 중인 공고가 없습니다." />
              )}
            </div>
          </section>

          {closedPrograms.length > 0 ? (
            <section className="mt-10" aria-label="마감 공고">
              <h2 className="text-lg font-semibold text-ink">마감 기록</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {closedPrograms.map((program) => <ProgramCard key={program.id} program={program} />)}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}

async function parseProgramFilters(searchParams: ProgramsPageProps["searchParams"]): Promise<ProgramFilters> {
  const params = await searchParams;

  return {
    keyword: normalizeKeyword(params.q),
    categoryCode: normalizeFilterValue(params.category),
    region: normalizeRegion(params.region)
  };
}

function normalizeFilterValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.trim();

  return normalized || undefined;
}

function normalizeKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.replace(/\s+/g, " ").trim().slice(0, MAX_KEYWORD_LENGTH);

  return normalized || undefined;
}

function normalizeRegion(value: string | string[] | undefined) {
  const code = normalizeFilterValue(value);

  return code ? findRegionByCode(code) ?? undefined : undefined;
}

function SearchForm({ filters }: { filters: ProgramFilters }) {
  return (
    <form action="/programs" className="flex flex-col gap-2 sm:flex-row">
      {filters.categoryCode ? <input type="hidden" name="category" value={filters.categoryCode} /> : null}
      {filters.region ? <input type="hidden" name="region" value={filters.region.code} /> : null}
      <label className="sr-only" htmlFor="program-search">
        공고 검색
      </label>
      <input
        id="program-search"
        name="q"
        type="search"
        defaultValue={filters.keyword ?? ""}
        placeholder="공고명, 기관명, 지역명 검색"
        className="min-h-11 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white"
      >
        <Search size={16} aria-hidden />
        검색
      </button>
    </form>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-2 text-sm font-semibold ${active ? "border-brand bg-brand text-white" : "border-line bg-white text-slate-700 hover:border-brand"}`}
    >
      {label}
    </Link>
  );
}

function createProgramHref(filters: ProgramFilters) {
  const params = new URLSearchParams();

  if (filters.categoryCode) {
    params.set("category", filters.categoryCode);
  }

  if (filters.region) {
    params.set("region", filters.region.code);
  }

  if (filters.keyword) {
    params.set("q", filters.keyword);
  }

  const query = params.toString();

  return query ? `/programs?${query}` : "/programs";
}
