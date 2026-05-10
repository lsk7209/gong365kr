import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/app/_components/empty-state";
import { EventCard } from "@/app/_components/event-card";
import { readEventData } from "@/lib/events/page-data";
import { listEventAreas, listEventTypes, listUpcomingEvents, type EventFacet } from "@/lib/events/query-repository";

export const revalidate = 3600;
const EVENTS_PAGE_LIMIT = 50;
const ALL_FILTER_VALUE = "all";

type EventsPageProps = {
  searchParams: Promise<{
    area?: string | string[];
    type?: string | string[];
  }>;
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
  const hasActiveFilters = Boolean(filters.areaName || filters.eventType);

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
          <div className="flex flex-col gap-4">
            <FilterGroup
              title="지역"
              paramName="area"
              activeValue={filters.areaName}
              facets={areaFacets}
              otherParamName="type"
              otherValue={filters.eventType}
            />
            <FilterGroup
              title="유형"
              paramName="type"
              activeValue={filters.eventType}
              facets={typeFacets}
              otherParamName="area"
              otherValue={filters.areaName}
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
            <EmptyState
              title="표시할 행사정보가 없습니다"
              description="다른 지역이나 유형을 선택하거나, 행사정보 동기화가 완료된 뒤 다시 확인해 주세요."
            />
          )}
        </div>
      </section>
    </main>
  );
}

async function parseEventFilters(searchParams: EventsPageProps["searchParams"]) {
  const params = await searchParams;

  return {
    areaName: normalizeFilterValue(params.area),
    eventType: normalizeFilterValue(params.type)
  };
}

function normalizeFilterValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.trim();

  return normalized && normalized !== ALL_FILTER_VALUE ? normalized : undefined;
}

function FilterGroup({
  title,
  paramName,
  activeValue,
  facets,
  otherParamName,
  otherValue
}: {
  title: string;
  paramName: "area" | "type";
  activeValue: string | undefined;
  facets: EventFacet[];
  otherParamName: "area" | "type";
  otherValue: string | undefined;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold text-ink">{title}</div>
      <div className="flex flex-wrap gap-2">
        <FilterLink label="전체" href={createFilterHref(paramName, undefined, otherParamName, otherValue)} active={!activeValue} />
        {facets.map((facet) => (
          <FilterLink
            key={facet.label}
            label={`${facet.label} ${facet.count}`}
            href={createFilterHref(paramName, facet.label, otherParamName, otherValue)}
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

function createFilterHref(
  paramName: "area" | "type",
  value: string | undefined,
  otherParamName: "area" | "type",
  otherValue: string | undefined
) {
  const params = new URLSearchParams();

  if (value) {
    params.set(paramName, value);
  }

  if (otherValue) {
    params.set(otherParamName, otherValue);
  }

  const query = params.toString();

  return query ? `/events?${query}` : "/events";
}
