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
  getEventType,
  isEventClosed
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
      title: "이벤트 상세",
      alternates: {
        canonical: `/events/${slug}`
      }
    };
  }

  const description = getEventSummary(event);

  return {
    title: `${event.title} | 이벤트`,
    description: description.slice(0, 120),
    alternates: {
      canonical: `/events/${event.slug}`
    },
    openGraph: {
      title: event.title,
      description,
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

  const detailSummary = getEventSummary(event);
  const eventType = getEventType(event);
  const eventArea = getEventArea(event);
  const eventOrg = getEventOrg(event);
  const sourceUrl = event.originUrl ?? event.rawUrl;
  const fileUrl = event.printFileUrl ?? event.attachmentUrl;
  const fileName = event.printFileName ?? event.attachmentName ?? "첨부 파일";
  const hasSourceUrl = Boolean(event.originUrl) && event.originUrl !== event.rawUrl;
  const periodText = formatEventPeriod(event.eventStart, event.eventEnd);
  const receptionText = formatEventPeriod(event.receptionStart, event.receptionEnd);
  const closed = isEventClosed(event);

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <EventJsonLd event={event} closed={closed} />

        <Link href="/events" className="text-sm font-semibold text-brand" aria-label="이벤트 목록으로 이동">
          이벤트 목록
        </Link>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-ink">{eventType}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-brand">{eventArea}</span>
            {closed ? <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">행사 종료</span> : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink">{event.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{detailSummary}</p>
          {closed ? (
            <p className="mt-4 rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              이 행사는 종료된 기록입니다. 이전 참여 조건과 유사 행사를 확인하는 참고 자료로 유지합니다.
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow icon={<CalendarDays size={18} aria-hidden />} label="이벤트 기간" value={periodText} />
          <InfoRow icon={<CalendarDays size={18} aria-hidden />} label="접수 기간" value={receptionText} />
          <InfoRow icon={<MapPin size={18} aria-hidden />} label="장소" value={eventArea} />
          <InfoRow icon={<FileText size={18} aria-hidden />} label="주최 기관" value={eventOrg} />
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-semibold text-ink">이벤트 안내</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <p>{eventType} 유형의 행사로, 이벤트 기간은 {periodText}입니다.</p>
            <p>접수는 {receptionText} 안에 진행되며, 자세한 신청 요건은 원문 공고에서 반드시 확인해야 합니다.</p>
            <p>최신 업데이트일: {formatEventDate(event.lastSyncedAt)} 기준입니다.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={event.rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
              title="공고 바로가기"
            >
              공고 바로가기
              <ExternalLink size={16} aria-hidden />
            </a>
            {hasSourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
                title="원문 페이지로 이동"
              >
                원문 링크
                <ExternalLink size={16} aria-hidden />
              </a>
            ) : null}
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
                title={fileName}
              >
                {fileName}
                <ExternalLink size={16} aria-hidden />
              </a>
            ) : null}
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-semibold text-ink">자주 묻는 질문</h2>
          <div className="mt-4 space-y-4">
            <FaqItem question="종료된 행사는 왜 남겨두나요?">
              종료된 행사는 다음 개최 일정과 참여 조건을 예측하는 참고 자료가 됩니다. 검색 노출과 내부 링크 흐름을 위해 URL도 유지합니다.
            </FaqItem>
            <FaqItem question="공고 링크와 원문 링크는 어떻게 다른가요?">
              공급처 정책에 따라 동일 페이지를 사용하는 경우도 있고, 분리된 페이지로 운영되는 경우도 있습니다.
            </FaqItem>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-xl font-semibold text-ink">참여 전 체크</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            행사 신청은 각 기관의 마감 정책을 따르므로, 참여 전 원문 공고에서 제출 서류와 제출 채널을 반드시 확인하세요.
          </p>
          <div className="mt-6">
            <Link
              href="/check"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              체크리스트 바로가기
              <FileText size={16} aria-hidden />
            </Link>
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
      <div className="mt-2 text-base font-semibold text-ink">{value}</div>
    </div>
  );
}

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <article>
      <h3 className="font-semibold text-ink">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  );
}

function EventJsonLd({
  event,
  closed
}: {
  event: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
  closed: boolean;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/events/${event.slug}`;
  const eventStart = event.eventStart ? event.eventStart.toISOString() : undefined;
  const eventEnd = event.eventEnd ? event.eventEnd.toISOString() : undefined;
  const publishedAt = event.createdAt?.toISOString() ?? new Date().toISOString();
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
      name: getEventArea(event)
    },
    organizer: {
      "@type": "Organization",
      name: getEventOrg(event)
    },
    datePublished: publishedAt,
    dateModified: modifiedAt,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "종료된 행사는 왜 남겨두나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "종료된 행사는 다음 개최 일정과 참여 조건을 예측하는 참고 자료가 되므로 URL을 유지합니다."
          }
        },
        {
          "@type": "Question",
          name: "주최 기관은 어디인가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `${getEventOrg(event)}에서 주관 또는 주최합니다.`
          }
        }
      ]
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
