import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import {
  formatEventDeadline,
  formatEventPeriod,
  getEventArea,
  getEventOrg,
  getEventSummary,
  getEventType,
  type EventListItem
} from "@/lib/events/display";

type EventCardProps = {
  event: EventListItem;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
          {getEventType(event)}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-signal">
          <CalendarDays size={14} aria-hidden />
          {formatEventDeadline(event.receptionEnd ?? event.eventEnd)}
        </span>
      </div>
      <h2 className="text-lg font-bold leading-7 text-ink">
        <Link href={`/events/${event.slug}`} className="hover:text-brand">
          {event.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{getEventSummary(event)}</p>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <MapPin size={16} className="shrink-0 text-brand" aria-hidden />
        <span>
          {getEventArea(event)} · {getEventOrg(event)}
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <span className="text-slate-500">{formatEventPeriod(event.eventStart, event.eventEnd)}</span>
        <a
          href={event.rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-brand"
        >
          원문
          <ExternalLink size={15} aria-hidden />
        </a>
      </div>
    </article>
  );
}
