import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/app/_components/empty-state";
import { EventCard } from "@/app/_components/event-card";
import { readEventData } from "@/lib/events/page-data";
import { listUpcomingEvents } from "@/lib/events/query-repository";

export const revalidate = 3600;
const EVENTS_PAGE_LIMIT = 50;

export const metadata = {
  title: "창업 행사정보",
  description: "중소기업과 창업자가 참여할 수 있는 교육, 세미나, 전시회 행사정보를 모았습니다.",
  alternates: {
    canonical: "/events"
  }
};

export default async function EventsPage() {
  const events = await readEventData([], (db) => listUpcomingEvents(db, EVENTS_PAGE_LIMIT));

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
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <EmptyState
              title="표시할 행사정보가 없습니다"
              description="행사정보 동기화가 완료되면 교육, 세미나, 전시회 일정이 이 영역에 표시됩니다."
            />
          )}
        </div>
      </section>
    </main>
  );
}
