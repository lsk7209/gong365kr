import { CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/app/_components/empty-state";
import { EventCard } from "@/app/_components/event-card";
import { readEventData } from "@/lib/events/page-data";
import { listEventAreas, listEventTypes, listUpcomingEvents, type EventFacet } from "@/lib/events/query-repository";

export const revalidate = 3600;
const EVENTS_PAGE_LIMIT = 50;
const ALL_FILTER_VALUE = "all";
const MAX_KEYWORD_LENGTH = 40;

type EventsPageProps = {
  searchParams: Promise<{
    area?: string | string[];
    type?: string | string[];
    q?: string | string[];
  }>;
};

type EventFilters = {
  areaName?: string;
  eventType?: string;
  keyword?: string;
};

export const metadata = {
  title: "창업 행사정보",
  description: "중소기업과 창업자가 참여할 수 있는 교육, 세미나, 전시회 행사정보를 모았습니다.",
  alternates: {
    canonical: "/events"
  }
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const filters = await parseEventFilters(searchParams);
  const [events, areaFacets, typeFacets] = await Promise.all([
    readEventData([], (db) => listUpcomingEvents(db, EVENTS_PAGE_LIMIT, new Date(), filters)),
    readEventData([], (db) => listEventAreas(db)),
    readEventData([], (db) => listEventTypes(db))
  ]);
  const hasActiveFilters = Boolean(filters.areaName || filters.eventType || filters.keyword);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Link href="/" className="text-sm font-semibold text-brand">
          창업머니맵
        </Link>
        <div className="mt-8 rounded-lg border border-line bg-slate-50 p-6">
          <CalendarDays className="text-signal" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-bold text-ink">창업 행사정보</h1>
          <p className="mt-3 leading-7 text-slate-600">
            기업마당에서 제공하는 교육, 세미나, 전시회, 사업설명회 정보를 행사일 순서로 정리했습니다.
          </p>
        </div>
        <section className="mt-6 border-y border-line py-5">
          <SearchForm filters={filters} />
          <div className="mt-5 flex flex-col gap-4">
            <FilterGroup
              title="지역"
              paramName="area"
              activeValue={filters.areaName}
              facets={areaFacets}
              nextFilters={filters}
            />
            <FilterGroup
              title="유형"
              paramName="type"
              activeValue={filters.eventType}
              facets={typeFacets}
              nextFilters={filters}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>{events.length}개 행사 표시</span>
            {hasActiveFilters ? (
              <Link href="/events" className="font-semibold text-brand">
                필터 초기화
              </Link>
            ) : null}
          </div>
        </section>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <EmptyState title="표시할 행사정보가 없습니다" description="검색어를 줄이거나 다른 지역·유형을 선택해 주세요." />
          )}
        </div>
      </section>
    </main>
  );
}

async function parseEventFilters(searchParams: EventsPageProps["searchParams"]): Promise<EventFilters> {
  const params = await searchParams;

  return {
    areaName: normalizeFilterValue(params.area),
    eventType: normalizeFilterValue(params.type),
    keyword: normalizeKeyword(params.q)
  };
}

function normalizeFilterValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.trim();

  return normalized && normalized !== ALL_FILTER_VALUE ? normalized : undefined;
}

function normalizeKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.replace(/\s+/g, " ").trim().slice(0, MAX_KEYWORD_LENGTH);

  return normalized || undefined;
}

function SearchForm({ filters }: { filters: EventFilters }) {
  return (
    <form action="/events" className="flex flex-col gap-2 sm:flex-row">
      {filters.areaName ? <input type="hidden" name="area" value={filters.areaName} /> : null}
      {filters.eventType ? <input type="hidden" name="type" value={filters.eventType} /> : null}
      <label className="sr-only" htmlFor="event-search">
        행사 검색어
      </label>
      <input
        id="event-search"
        name="q"
        type="search"
        defaultValue={filters.keyword ?? ""}
        placeholder="행사명, 기관명, 지역 검색"
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

function FilterGroup({
  title,
  paramName,
  activeValue,
  facets,
  nextFilters
}: {
  title: string;
  paramName: "area" | "type";
  activeValue: string | undefined;
  facets: EventFacet[];
  nextFilters: EventFilters;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold text-ink">{title}</div>
      <div className="flex flex-wrap gap-2">
        <FilterLink label="전체" href={createFilterHref(paramName, undefined, nextFilters)} active={!activeValue} />
        {facets.map((facet) => (
          <FilterLink
            key={facet.label}
            label={`${facet.label} ${facet.count}`}
            href={createFilterHref(paramName, facet.label, nextFilters)}
            active={activeValue === facet.label}
          />
        ))}
      </div>
    </div>
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

function createFilterHref(paramName: "area" | "type", value: string | undefined, filters: EventFilters) {
  const params = new URLSearchParams();
  const areaName = paramName === "area" ? value : filters.areaName;
  const eventType = paramName === "type" ? value : filters.eventType;

  if (areaName) {
    params.set("area", areaName);
  }

  if (eventType) {
    params.set("type", eventType);
  }

  if (filters.keyword) {
    params.set("q", filters.keyword);
  }

  const query = params.toString();

  return query ? `/events?${query}` : "/events";
}
