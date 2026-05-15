import { ArrowRight, CalendarClock, CheckCircle2 } from "lucide-react";
import {
  formatDate,
  formatDeadline,
  getProgramAgency,
  getProgramCategory,
  getProgramSummary,
  isProgramClosed,
  type ProgramListItem,
} from "@/lib/programs/display";
import { TrackableAnchor } from "@/app/_components/trackable-anchor";
import { TrackableLink } from "@/app/_components/trackable-link";

type ProgramCardProps = {
  program: ProgramListItem;
};

export function ProgramCard({ program }: ProgramCardProps) {
  const detailHref = `/programs/${program.slug}`;
  const closed = isProgramClosed(program);
  const canApply = !closed;
  const deadlineClassName = closed
    ? "inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500"
    : "inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-signal";

  return (
    <article
      className="rounded-lg border border-line bg-white p-5 shadow-panel"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 200px" }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-brand">
          {getProgramCategory(program)}
        </span>
        <span className={deadlineClassName}>
          <CalendarClock size={14} aria-hidden />
          {formatDeadline(program)}
        </span>
      </div>
      <h2 className="text-lg font-bold leading-7 text-ink">
        <TrackableLink
          href={detailHref}
          className="hover:text-brand"
          label={`${program.slug}-title`}
          eventParams={{ content_type: "program", content_id: program.id }}
        >
          {program.title}
        </TrackableLink>
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {getProgramSummary(program)}
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <CheckCircle2 size={16} className="shrink-0 text-brand" aria-hidden />
        <span>{getProgramAgency(program)}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <span className="text-slate-500">
          마감일 {formatDate(program.applicationEnd)}
        </span>
        <TrackableLink
          href={detailHref}
          className="inline-flex items-center gap-1 font-semibold text-brand"
          label={`${program.slug}-detail`}
          eventParams={{
            content_type: "program",
            content_id: program.id,
            action: "open_detail",
          }}
        >
          자세히 보기
          <ArrowRight size={15} aria-hidden />
        </TrackableLink>
      </div>
      {canApply ? (
        <TrackableAnchor
          href={program.rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-sm font-semibold text-brand"
          label={`${program.slug}-external`}
          eventParams={{
            content_type: "program",
            content_id: program.id,
            action: "open_external",
          }}
        >
          공고 바로가기
        </TrackableAnchor>
      ) : (
        <span className="mt-4 block text-sm text-slate-400">
          마감된 공고(기록 조회)
        </span>
      )}
    </article>
  );
}
