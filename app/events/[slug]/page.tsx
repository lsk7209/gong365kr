import { CalendarDays, ExternalLink, FileText, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GaContentComplete } from "@/app/_components/ga-content-complete";
import { TrackableAnchor } from "@/app/_components/trackable-anchor";
import { TrackableLink } from "@/app/_components/trackable-link";
import {
  formatEventDate,
  formatEventPeriod,
  getEventArea,
  getEventOrg,
  getEventSummary,
  getEventType,
  isEventClosed,
} from "@/lib/events/display";
import { readEventData } from "@/lib/events/page-data";
import { getEventBySlug } from "@/lib/events/query-repository";
import { getSiteUrl } from "@/lib/site";

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
      title: "이벤트 없음",
      alternates: {
        canonical: `/events/${slug}`,
      },
    };
  }

  const description = getEventSummary(event);

  return {
    title: `${event.title} | 이벤트`,
    description: description.slice(0, 120),
    alternates: {
      canonical: `/events/${event.slug}`,
    },
    openGraph: {
      title: event.title,
      description,
      locale: "ko_KR",
      type: "article",
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;
  const event = await readEventData(null, (db) => getEventBySlug(db, slug));

  if (!event) {
    notFound();
  }

  const detailSummary = getEventSummary(event);
  const eventType = getEventType(event);
  const eventArea = getEventArea(event);
  const eventOrg = getEventOrg(event);
  const sourceUrl = event.originUrl ?? event.rawUrl;
  const fileUrl = event.printFileUrl ?? event.attachmentUrl;
  const fileName = event.printFileName ?? event.attachmentName ?? "첨부파일";
  const hasSourceUrl =
    Boolean(event.originUrl) && event.originUrl !== event.rawUrl;
  const periodText = formatEventPeriod(event.eventStart, event.eventEnd);
  const receptionText = formatEventPeriod(
    event.receptionStart,
    event.receptionEnd,
  );
  const closed = isEventClosed(event);
  const canApply = !closed;

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <EventJsonLd event={event} closed={closed} />
        <GaContentComplete
          contentType="event"
          title={event.title}
          id={event.slug}
        />

        <TrackableLink
          href="/events"
          className="text-sm font-semibold text-brand"
          label="event-back"
          aria-label="이벤트 목록으로 돌아가기"
        >
          목록으로
        </TrackableLink>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-ink">
              {eventType}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-brand">
              {eventArea}
            </span>
            {closed ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                이벤트 종료
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink">
            {event.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {detailSummary}
          </p>
          {closed ? (
            <p className="mt-4 rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              종료된 이벤트입니다. 신청이 가능한 경우 담당 기관에 문의하거나
              홈페이지에서 일정을 확인하세요.
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow
            icon={<CalendarDays size={18} aria-hidden />}
            label="이벤트 기간"
            value={periodText}
          />
          <InfoRow
            icon={<CalendarDays size={18} aria-hidden />}
            label="접수 기간"
            value={receptionText}
          />
          <InfoRow
            icon={<MapPin size={18} aria-hidden />}
            label="지역"
            value={eventArea}
          />
          <InfoRow
            icon={<FileText size={18} aria-hidden />}
            label="주최기관"
            value={eventOrg}
          />
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-semibold text-ink">이벤트 안내</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <p>
              {eventType} 이벤트가 {eventArea}에서 진행되며, 기간은 {periodText}
              입니다.
            </p>
            <p>접수는 {receptionText} 사이에 가능합니다.</p>
            <p>최종 업데이트: {formatEventDate(event.lastSyncedAt)} 기준</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {canApply ? (
              <TrackableAnchor
                href={event.rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                label={`${event.slug}-event-main`}
                eventParams={{
                  content_type: "event",
                  content_id: event.id,
                  action: "open_event",
                }}
                title="행사 신청 바로가기"
              >
                행사 신청 바로가기
                <ExternalLink size={16} aria-hidden />
              </TrackableAnchor>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400">
                마감된 행사(기록 조회)
                <ExternalLink size={16} aria-hidden />
              </span>
            )}
            {hasSourceUrl ? (
              <TrackableAnchor
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
                label={`${event.slug}-source`}
                eventParams={{
                  content_type: "event",
                  content_id: event.id,
                  action: "open_source",
                }}
                title="원문 보기"
              >
                원문 보기
                <ExternalLink size={16} aria-hidden />
              </TrackableAnchor>
            ) : null}
            {fileUrl ? (
              <TrackableAnchor
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
                label={`${event.slug}-file`}
                eventParams={{
                  content_type: "event",
                  content_id: event.id,
                  action: "open_file",
                }}
                title={fileName}
              >
                {fileName}
                <ExternalLink size={16} aria-hidden />
              </TrackableAnchor>
            ) : null}
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-semibold text-ink">FAQ</h2>
          <div className="mt-4 space-y-4">
            <FaqItem question="이벤트 종료 후에도 신청할 수 있나요?">
              종료된 이벤트는 기록으로만 보관되며 신청은 불가합니다.
            </FaqItem>
            <FaqItem question="첨부 파일이 없어요?">
              담당 기관 홈페이지에서 관련 파일 목록을 다시 확인하시고 변경된
              경로로 접근하세요.
            </FaqItem>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-xl font-semibold text-ink">적합성 확인</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            이벤트의 기간 조건이나 일정·접수 요건이 변경될 수 있으므로 참여 전에
            정기적으로 확인하세요.
          </p>
          <div className="mt-6">
            <TrackableLink
              href="/check"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
              label={`${event.slug}-check`}
              eventParams={{
                content_type: "event",
                content_id: event.id,
                action: "open_check",
              }}
            >
              체크리스트 확인
              <FileText size={16} aria-hidden />
            </TrackableLink>
          </div>
        </section>
      </article>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-ink">{value}</div>
    </div>
  );
}

function FaqItem({
  question,
  children,
}: {
  question: string;
  children: ReactNode;
}) {
  return (
    <article>
      <h3 className="font-semibold text-ink">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{children}</p>
    </article>
  );
}

function EventJsonLd({
  event,
  closed,
}: {
  event: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
  closed: boolean;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/events/${event.slug}`;
  const eventStart = event.eventStart
    ? event.eventStart.toISOString()
    : undefined;
  const eventEnd = event.eventEnd ? event.eventEnd.toISOString() : undefined;
  const publishedAt =
    event.createdAt?.toISOString() ?? new Date().toISOString();
  const modifiedAt = event.lastSyncedAt?.toISOString() ?? publishedAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: getEventSummary(event),
    url: pageUrl,
    startDate: eventStart,
    endDate: eventEnd,
    eventStatus: closed ? "EventCompleted" : "EventScheduled",
    eventAttendanceMode: "OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: getEventArea(event),
    },
    organizer: {
      "@type": "Organization",
      name: getEventOrg(event),
    },
    datePublished: publishedAt,
    dateModified: modifiedAt,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "이벤트 종료 후 신청 가능한가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "이벤트가 종료된 경우에는 일반적으로 신청이 불가합니다. 재공고가 있을 수 있으니 담당기관에 문의하세요.",
          },
        },
        {
          "@type": "Question",
          name: "첨부 파일은 어디서 확인하나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `${getEventOrg(event)} 홈페이지나 담당 부서에서 관련 파일 목록을 확인하세요.`,
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
