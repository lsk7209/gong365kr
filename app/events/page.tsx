import { CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/app/_components/empty-state";
import { EventCard } from "@/app/_components/event-card";
import { readEventData } from "@/lib/events/page-data";
import {
  listClosedEvents,
  listEventAreas,
  listEventTypes,
  listOpenEvents,
  type EventFacet
} from "@/lib/events/query-repository";

export const revalidate = 21600;
const EVENTS_PAGE_LIMIT = 50;
const EVENTS_CLOSED_PAGE_LIMIT = 30;
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
  title: "행사 공지",
  description: "국민·지자체·교육기관 주최 행사 공고와 지원 프로그램을 한 곳에서 확인할 수 있습니다.",
  alternates: {
    canonical: "/events"
  },
  openGraph: {
    title: "행사 공지",
    description: "주요 행사를 일자, 지역, 유형별로 분류해서 확인하고 신청 마감 여부를 즉시 파악할 수 있습니다.",
    locale: "ko_KR",
    type: "website"
  }
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const filters = await parseEventFilters(searchParams);
  const [events, closedEvents, areaFacets, typeFacets] = await Promise.all([
    readEventData([], (db) => listOpenEvents(db, EVENTS_PAGE_LIMIT, filters, new Date())),
    readEventData([], (db) => listClosedEvents(db, EVENTS_CLOSED_PAGE_LIMIT, new Date(), filters)),
    readEventData([], (db) => listEventAreas(db)),
    readEventData([], (db) => listEventTypes(db))
  ]);
  const activeEvents = events;
  const hasActiveFilters = Boolean(filters.areaName || filters.eventType || filters.keyword);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <header className="rounded-lg border border-line bg-slate-50 p-6">
          <CalendarDays className="text-signal" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-semibold text-ink">행사 공지</h1>
          <p className="mt-3 leading-7 text-slate-600">
            행사 일정과 공고를 지역, 유형별로 찾아볼 수 있으며, 마감된 행사도 기록으로 남겨 과거 이력을 확인할 수 있습니다.
          </p>
        </header>

        <section className="mt-6 border-y border-line py-5" aria-label="행사 검색 필터">
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
            <span>{activeEvents.length + closedEvents.length}건의 행사</span>
            {hasActiveFilters ? (
              <Link href="/events" className="font-semibold text-brand">
                전체 초기화
              </Link>
            ) : null}
          </div>
        </section>

        <div className="mt-6">
          <section aria-label="진행 중 행사">
            <h2 className="text-lg font-semibold text-ink">진행 중</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {activeEvents.length > 0 ? (
                activeEvents.map((event) => <EventCard key={event.id} event={event} />)
              ) : (
                <EmptyState title="진행 중 행사 없음" description="현재 조건에 맞는 진행 중 행사가 없습니다." />
              )}
            </div>
          </section>

          {closedEvents.length > 0 ? (
            <section className="mt-10" aria-label="마감 행사">
              <h2 className="text-lg font-semibold text-ink">마감 기록</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {closedEvents.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            </section>
          ) : null}
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
        행사 검색
      </label>
      <input
        id="event-search"
        name="q"
        type="search"
        defaultValue={filters.keyword ?? ""}
        placeholder="행사명, 지역, 유형 검색"
        className="min-h-11 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white"
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
      <div className="mb-2 text-sm font-semibold text-ink">{title}</div>
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
      className={`rounded-full border px-3 py-2 text-sm font-semibold ${
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
