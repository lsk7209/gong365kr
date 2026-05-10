import { ArrowRight, CalendarClock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  formatDate,
  formatDeadline,
  getProgramAgency,
  getProgramCategory,
  getProgramSummary,
  type ProgramListItem
} from "@/lib/programs/display";

type ProgramCardProps = {
  program: ProgramListItem;
};

export function ProgramCard({ program }: ProgramCardProps) {
  const detailHref = `/programs/${program.slug}`;

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-brand">
          {getProgramCategory(program)}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-signal">
          <CalendarClock size={14} aria-hidden />
          {formatDeadline(program.applicationEnd)}
        </span>
      </div>
      <h2 className="text-lg font-bold leading-7 text-ink">
        <Link href={detailHref} className="hover:text-brand">
          {program.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{getProgramSummary(program)}</p>
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <CheckCircle2 size={16} className="shrink-0 text-brand" aria-hidden />
        <span>{getProgramAgency(program)}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <span className="text-slate-500">마감 {formatDate(program.applicationEnd)}</span>
        <Link href={detailHref} className="inline-flex items-center gap-1 font-semibold text-brand">
          상세보기
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
