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
      title: "?됱궗 ?곸꽭",
      alternates: {
        canonical: `/events/${slug}`
      }
    };
  }

  const description = getEventSummary(event);

  return {
    title: `${event.title} | ?됱궗`,
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
  const fileName = event.printFileName ?? event.attachmentName ?? "泥⑤??뚯씪";
  const hasSourceUrl = Boolean(event.originUrl) && event.originUrl !== event.rawUrl;
  const periodText = formatEventPeriod(event.eventStart, event.eventEnd);
  const receptionText = formatEventPeriod(event.receptionStart, event.receptionEnd);
  const closed = isEventClosed(event);
  const canApply = !closed;

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <EventJsonLd event={event} closed={closed} />
        <GaContentComplete contentType="event" title={event.title} id={event.slug} />

        <TrackableLink href="/events" className="text-sm font-semibold text-brand" label="event-back" aria-label="?됱궗 紐⑸줉?쇰줈 ?뚯븘媛湲?>
          紐⑸줉?쇰줈
        </TrackableLink>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-ink">{eventType}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-brand">{eventArea}</span>
            {closed ? <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">?됱궗 醫낅즺</span> : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink">{event.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{detailSummary}</p>
          {closed ? (
            <p className="mt-4 rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              醫낅즺???됱궗???좎껌??遺덇??ν븷 ???덉쑝硫? 二쇱턀 痢≪뿉???곗옣/?ш컻理쒓? ?덈뒗吏 怨듭떇 怨듭?瑜??뺤씤?섏꽭??
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow icon={<CalendarDays size={18} aria-hidden />} label="?됱궗 湲곌컙" value={periodText} />
          <InfoRow icon={<CalendarDays size={18} aria-hidden />} label="?묒닔 湲곌컙" value={receptionText} />
          <InfoRow icon={<MapPin size={18} aria-hidden />} label="吏?? value={eventArea} />
          <InfoRow icon={<FileText size={18} aria-hidden />} label="二쇨?湲곌?" value={eventOrg} />
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-semibold text-ink">?됱궗 ?덈궡</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <p>
              {eventType} ?됱궗??{eventArea}?먯꽌 吏꾪뻾?섎ŉ, 湲곌컙? {periodText}?낅땲??
            </p>
            <p>?묒닔??{receptionText} ?댁뿉 媛?ν빀?덈떎.</p>
            <p>理쒖떊 ?숆린?? {formatEventDate(event.lastSyncedAt)} 湲곗?</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
                        {canApply ? (
              <TrackableAnchor
                href={event.rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                label={`${event.slug}-event-main`}
                eventParams={{ content_type: "event", content_id: event.id, action: "open_event" }}
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
                eventParams={{ content_type: "event", content_id: event.id, action: "open_source" }}
                title="?먮Ц 蹂닿린"
              >
                ?먮Ц 蹂닿린
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
                eventParams={{ content_type: "event", content_id: event.id, action: "open_file" }}
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
            <FaqItem question="?됱궗 醫낅즺 ?꾩뿉???좎껌?????덈굹??">
              醫낅즺???됱궗???먯튃?곸쑝濡??좉퇋 ?좎껌??遺덇??⑸땲??
            </FaqItem>
            <FaqItem question="泥⑤? ?뚯씪???놁뼱??">
              二쇱턀 湲곌? 怨듭??ы빆?먯꽌 ?쒖텧 ?뚯씪 ?꾩튂瑜??ㅼ떆 ?뺤씤?섍퀬 蹂寃쎈맂 寃쎈줈瑜?諛섏쁺?댁빞 ?⑸땲??
            </FaqItem>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-xl font-semibold text-ink">?좎쓽?ы빆</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            ?됱궗??湲곌? ?뺤콉???곕씪 ?쇱젙쨌?묒닔 議곌굔??蹂寃쎈맆 ???덉쑝誘濡?理쒖쥌 ?섏씠吏 湲곗??쇰줈 ?ы솗?명븯?몄슂.
          </p>
          <div className="mt-6">
            <TrackableLink
              href="/check"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
              label={`${event.slug}-check`}
              eventParams={{ content_type: "event", content_id: event.id, action: "open_check" }}
            >
              泥댄겕由ъ뒪???뺤씤
              <FileText size={16} aria-hidden />
            </TrackableLink>
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
      <p className="mt-2 text-sm leading-6 text-slate-700">{children}</p>
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
          name: "?됱궗 醫낅즺 ???좎껌 媛?ν븳媛??",
          acceptedAnswer: {
            "@type": "Answer",
            text: "?됱궗媛 醫낅즺??寃쎌슦?먮뒗 二쇱턀 痢≪씠 蹂꾨룄 ?덈궡?섏? ?딆쑝硫??묒닔?????놁뒿?덈떎."
          }
        },
        {
          "@type": "Question",
          name: "泥⑤? ?먮즺???대뵒??諛쏆븘???섎굹??",
          acceptedAnswer: {
            "@type": "Answer",
            text: `${getEventOrg(event)}??怨듭??ы빆?대굹 怨듭떇 梨꾨꼸?먯꽌 理쒖쥌 泥⑤? ?먮즺 留곹겕瑜??뺤씤?섏꽭??`
          }
        }
      ]
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

