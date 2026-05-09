import { CalendarDays, ExternalLink, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  formatEventDate,
  formatEventPeriod,
  getEventArea,
  getEventOrg,
  getEventSummary,
  getEventType
} from "@/lib/events/display";
import { readEventData } from "@/lib/events/page-data";
import { getEventBySlug } from "@/lib/events/query-repository";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await readEventData(null, (db) => getEventBySlug(db, slug));

  if (!event) {
    return {
      title: "창업 행사정보",
      alternates: {
        canonical: `/events/${slug}`
      }
    };
  }

  return {
    title: `${event.title} | 창업 행사정보`,
    description: getEventSummary(event).slice(0, 120),
    alternates: {
      canonical: `/events/${event.slug}`
    },
    openGraph: {
      title: event.title,
      description: getEventSummary(event).slice(0, 120),
      locale: "ko_KR",
      type: "article"
    }
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await readEventData(null, (db) => getEventBySlug(db, slug));

  if (!event) {
    notFound();
  }

  const sourceUrl = event.originUrl ?? event.rawUrl;
  const fileUrl = event.printFileUrl ?? event.attachmentUrl;
  const fileName = event.printFileName ?? event.attachmentName ?? "첨부파일";

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/events" className="text-sm font-semibold text-brand">
          행사정보 목록
        </Link>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-amber-700">{getEventType(event)}</span>
            <span className="rounded-md bg-teal-50 px-2.5 py-1 text-brand">{getEventArea(event)}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">{event.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{getEventSummary(event)}</p>
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow icon={<CalendarDays size={18} aria-hidden />} label="행사기간" value={formatEventPeriod(event.eventStart, event.eventEnd)} />
          <InfoRow icon={<CalendarDays size={18} aria-hidden />} label="접수기간" value={formatEventPeriod(event.receptionStart, event.receptionEnd)} />
          <InfoRow icon={<MapPin size={18} aria-hidden />} label="지역" value={getEventArea(event)} />
          <InfoRow icon={<FileText size={18} aria-hidden />} label="출처기관" value={getEventOrg(event)} />
        </section>

        <section className="py-8">
          <h2 className="text-xl font-bold text-ink">확인할 내용</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <p>행사 유형은 {getEventType(event)}이며, 행사 일정은 {formatEventPeriod(event.eventStart, event.eventEnd)}입니다.</p>
            <p>신청 또는 참여 조건, 장소, 세부 프로그램은 원문 페이지에서 최종 확인해야 합니다.</p>
            <p>이 정보는 {formatEventDate(event.lastSyncedAt)} 기준으로 동기화되었습니다.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={event.rawUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white"
            >
              기업마당에서 보기
              <ExternalLink size={16} aria-hidden />
            </a>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink"
            >
              출처 페이지
              <ExternalLink size={16} aria-hidden />
            </a>
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink"
              >
                {fileName}
                <ExternalLink size={16} aria-hidden />
              </a>
            ) : null}
          </div>
        </section>
      </article>
    </main>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-base font-bold text-ink">{value}</div>
    </div>
  );
}
