import { CalendarClock, CheckCircle2, ExternalLink, FileText, WalletCards } from "lucide-react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GaContentComplete } from "@/app/_components/ga-content-complete";
import { TrackableAnchor } from "@/app/_components/trackable-anchor";
import { TrackableLink } from "@/app/_components/trackable-link";
import { RelatedProgramList } from "@/app/_components/related-program-list";
import {
  formatDate,
  formatDeadline,
  getProgramAgency,
  getProgramCategory,
  getProgramSummary,
  isProgramClosed,
  type ProgramListItem
} from "@/lib/programs/display";
import { readProgramData } from "@/lib/programs/page-data";
import { getProgramBySlug } from "@/lib/programs/query-repository";
import { getSiteName, getSiteUrl } from "@/lib/site";

type ProgramDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = await readProgramData(null, (db) => getProgramBySlug(db, slug));

  if (!program) {
    return {
      title: "?꾨줈洹몃옩 ?곸꽭",
      alternates: {
        canonical: `/programs/${slug}`
      }
    };
  }

  const description = getProgramSummary(program);

  return {
    title: `${program.title} | ${getSiteName()}`,
    description: description.slice(0, 120),
    alternates: {
      canonical: `/programs/${program.slug}`
    },
    openGraph: {
      title: program.title,
      description,
      locale: "ko_KR",
      type: "article"
    }
  };
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = await readProgramData(null, (db) => getProgramBySlug(db, slug));

  if (!program) {
    notFound();
  }

  const detailSummary = getProgramSummary(program);
  const category = getProgramCategory(program);
  const agency = getProgramAgency(program);
  const startAt = formatDate(program.applicationStart);
  const endAt = formatDate(program.applicationEnd);
  const closed = isProgramClosed(program);
  const canApply = !closed;

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <ProgramJsonLd program={program} />
        <GaContentComplete contentType="program" title={program.title} id={program.slug} />

        <TrackableLink href="/programs" className="text-sm font-semibold text-brand" label="program-back">
          紐⑸줉?쇰줈
        </TrackableLink>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-brand">{category}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{formatDeadline(program)}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">{program.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{detailSummary}</p>
          {closed ? (
            <p className="mt-4 rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              醫낅즺??怨듦퀬?낅땲?? 湲곗〈 ?좎껌 ?뺣낫???붿빟留??좎??⑸땲??
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow icon={<CalendarClock size={18} aria-hidden />} label="?좎껌 ?쒖옉" value={startAt} />
          <InfoRow icon={<CalendarClock size={18} aria-hidden />} label="?좎껌 醫낅즺" value={endAt} />
          <InfoRow icon={<CheckCircle2 size={18} aria-hidden />} label="?댁쁺湲곌?" value={agency} />
          <InfoRow icon={<WalletCards size={18} aria-hidden />} label="遺꾨쪟" value={category} />
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">?꾨줈洹몃옩 媛쒖슂</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {program.title}??{category} 移댄뀒怨좊━??吏?먯궗??怨듦퀬瑜??뺣━???섏씠吏?낅땲??
            醫낅즺?쇱씠 {endAt}濡??ㅼ젙???덉뼱 留덇컧??怨듦퀬??李멸퀬?⑹쑝濡??⑥븘 ?덉뒿?덈떎.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{detailSummary}</p>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">?좎껌 泥댄겕由ъ뒪??/h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <CheckBlock title="?먭꺽 ?붽굔" description="?좎껌 媛??議곌굔怨??쒖텧 ?쒕쪟瑜?癒쇱? ?뺤씤?⑸땲??" />
            <CheckBlock title="?쇱젙 ?뺤씤" description="?묒닔 ?쇱젙, 留덇컧?? 寃곌낵 諛쒗몴?쇱쓣 癒쇱? ?먭??⑸땲??" />
            <CheckBlock
              title="?쒖텧 ?곹깭"
              description="吏???뺣낫 ?깅줉 ???곹깭瑜?異붿쟻??理쒖쥌 ?⑷꺽 ?щ?瑜??뺤씤?섏꽭??"
            />
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">FAQ</h2>
          <div className="mt-4 space-y-4">
            <FaqItem question="?좎껌 留덇컧?쇱씠 吏?щ뒗???묒닔 媛?ν븳媛??">
              留덇컧?쇱씠 吏??寃쎌슦?먮뒗 湲곌? 蹂?湲곗????곕씪 ?묒닔媛 遺덇??????덉뒿?덈떎.
            </FaqItem>
            <FaqItem question="?꾩슂 ?쒕쪟???대뵒???뺤씤?섎굹??">
              怨듦퀬 蹂몃Ц 諛?怨듭떇 ?덈궡 ?섏씠吏?먯꽌 ?쒖텧 ?쒕쪟 紐⑸줉??理쒖슦?좎쑝濡??뺤씤?댁빞 ?⑸땲??
            </FaqItem>
          </div>
        </section>

        <RelatedProgramList program={program} />

        <section className="py-8">
          <h2 className="text-xl font-bold text-ink">愿???덈궡</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            留덇컧 怨듦퀬?쇰룄 ?좎궗 怨듦퀬? 怨듭떇 留곹겕瑜??듯빐 ?泥??좎껌 媛?ν븳 ?뺣낫瑜??④퍡 ?먭??섏꽭??
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
                        {canApply ? (
              <TrackableAnchor
                href={program.rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                label={`${program.slug}-official`}
                eventParams={{ content_type: "program", content_id: program.id, action: "open_official" }}
              >
                공고 바로가기
                <ExternalLink size={16} aria-hidden />
              </TrackableAnchor>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400">
                마감된 공고(기록 조회)
                <ExternalLink size={16} aria-hidden />
              </span>
            )}
            <TrackableLink
              href="/check"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
              label={`${program.slug}-check`}
              eventParams={{ content_type: "program", content_id: program.id, action: "open_check" }}
            >
              泥댄겕由ъ뒪??              <FileText size={16} aria-hidden />
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
      <div className="mt-2 text-base font-bold text-ink">{value}</div>
    </div>
  );
}

function CheckBlock({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-lg border border-line p-4">
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <article>
      <h3 className="font-bold text-ink">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{children}</p>
    </article>
  );
}

function ProgramJsonLd({ program }: { program: ProgramListItem }) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/programs/${program.slug}`;
  const publishedAt = program.applicationStart?.toISOString() ?? new Date().toISOString();
  const updatedAt = program.applicationEnd?.toISOString() ?? publishedAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: program.title,
    description: getProgramSummary(program),
    url: pageUrl,
    author: { "@type": "Organization", name: getProgramAgency(program) },
    publisher: { "@type": "Organization", name: getSiteName() },
    articleSection: getProgramCategory(program),
    datePublished: publishedAt,
    dateModified: updatedAt,
    mainEntityOfPage: {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "?좎껌 留덇컧?쇱씠 吏?щ뒗??媛?ν븳媛??",
          acceptedAnswer: {
            "@type": "Answer",
            text: "留덇컧?쇱씠 吏???꾩뿉??湲곌? ?덈궡???곕씪 ?묒닔媛 ?쒗븳?????덉뒿?덈떎."
          }
        },
        {
          "@type": "Question",
          name: "?꾩슂???쒖텧 ?쒕쪟???대뵒???뺤씤?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "怨듦퀬 蹂몃Ц 諛?怨듭떇 ?덈궡 ?섏씠吏?먯꽌 ?꾩닔 ?쒖텧 ?먮즺瑜??뺤씤?댁빞 ?⑸땲??"
          }
        }
      ]
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

