import { EventCard } from "@/app/_components/event-card";
import type { EventListItem } from "@/lib/events/display";
import { readEventData } from "@/lib/events/page-data";
import { listUpcomingEvents } from "@/lib/events/query-repository";

const RELATED_EVENT_LIMIT = 3;

type RelatedEventListProps = {
  event: Pick<EventListItem, "id" | "slug">;
};

export async function RelatedEventList({ event }: RelatedEventListProps) {
  const all = await readEventData([], (db) =>
    listUpcomingEvents(db, RELATED_EVENT_LIMIT + 1),
  );
  const related = all
    .filter((e) => e.slug !== event.slug)
    .slice(0, RELATED_EVENT_LIMIT);

  if (related.length === 0) return null;

  return (
    <section className="border-b border-line py-8">
      <h2 className="text-xl font-semibold text-ink">다른 행사 보기</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}
