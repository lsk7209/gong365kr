import { Search, WalletCards } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/app/_components/empty-state";
import { ProgramCard } from "@/app/_components/program-card";
import { readProgramData } from "@/lib/programs/page-data";
import {
  countActiveProgramsByCategory,
  countProgramsByRegions,
  listActivePrograms,
  type ProgramFilterInput
} from "@/lib/programs/query-repository";
import { findRegionByCode, regionRows } from "@/lib/regions";

export const revalidate = 3600;
const PROGRAMS_PAGE_LIMIT = 50;
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
  title: "창업지원사업 공고",
  description: "마감 전 창업지원사업, 정책자금, 보조금 공고를 검색하고 확인할 수 있습니다.",
  alternates: {
    canonical: "/programs"
  }
};

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const filters = await parseProgramFilters(searchParams);
  const [programs, categoryFacets, regionFacets] = await Promise.all([
    readProgramData([], (db) => listActivePrograms(db, PROGRAMS_PAGE_LIMIT, filters)),
    readProgramData([], (db) => countActiveProgramsByCategory(db, CATEGORY_FACET_LIMIT)),
    readProgramData([], (db) => countProgramsByRegions(db, regionRows))
  ]);
  const hasActiveFilters = Boolean(filters.keyword || filters.categoryCode || filters.region);
  const selectedRegionCode = filters.region?.code;

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-lg border border-line bg-slate-50 p-6">
          <WalletCards className="text-signal" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-bold text-ink">창업지원사업 공고</h1>
          <p className="mt-3 leading-7 text-slate-600">
            마감 전 창업지원사업과 정책자금 공고를 마감일 순서로 정리했습니다.
          </p>
        </div>

        <section className="mt-6 border-y border-line py-5">
          <SearchForm filters={filters} />
          <div className="mt-5">
            <div className="mb-2 text-sm font-bold text-ink">분야</div>
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
            <span>{programs.length}개 공고 표시</span>
            {hasActiveFilters ? (
              <Link href="/programs" className="font-semibold text-brand">
                필터 초기화
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {programs.length > 0 ? (
            programs.map((program) => <ProgramCard key={program.id} program={program} />)
          ) : (
            <EmptyState title="표시할 지원사업 공고가 없습니다" description="검색어를 줄이거나 다른 분야를 선택해 주세요." />
          )}
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
        지원사업 검색어
      </label>
      <input
        id="program-search"
        name="q"
        type="search"
        defaultValue={filters.keyword ?? ""}
        placeholder="공고명, 기관명, 분야 검색"
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
      className={`rounded-md border px-3 py-2 text-sm font-semibold ${
        active ? "border-brand bg-brand text-white" : "border-line bg-white text-slate-700 hover:border-brand"
      }`}
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
