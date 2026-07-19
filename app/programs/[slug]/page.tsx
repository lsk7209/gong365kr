import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  WalletCards,
} from "lucide-react";
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
  type ProgramListItem,
} from "@/lib/programs/display";
import { readProgramData } from "@/lib/programs/page-data";
import { getProgramBySlug } from "@/lib/programs/query-repository";
import { getSiteName, getSiteUrl } from "@/lib/site";

type ProgramDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 21600;

export async function generateMetadata({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = await readProgramData(null, (db) =>
    getProgramBySlug(db, slug),
  );

  if (!program) {
    return {
      title: "공고 없음",
      alternates: {
        canonical: `/programs/${slug}`,
      },
    };
  }

  const description = getProgramSummary(program);

  return {
    title: program.title,
    description: description.slice(0, 120),
    alternates: {
      canonical: `/programs/${program.slug}`,
    },
    openGraph: {
      title: program.title,
      description,
      locale: "ko_KR",
      type: "article",
    },
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = await readProgramData(null, (db) =>
    getProgramBySlug(db, slug),
  );

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
        <FaqPageJsonLd program={program} />
        <BreadcrumbJsonLd program={program} />
        <GaContentComplete
          contentType="program"
          title={program.title}
          id={program.slug}
        />

        <TrackableLink
          href="/programs"
          className="text-sm font-semibold text-brand"
          label="program-back"
        >
          목록으로
        </TrackableLink>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-brand">
              {category}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {formatDeadline(program)}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">
            {program.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {detailSummary}
          </p>
          {closed ? (
            <p className="mt-4 rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              마감된 공고입니다. 현재 신청 정보는 참고용으로만 확인하세요.
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow
            icon={<CalendarClock size={18} aria-hidden />}
            label="신청 시작"
            value={startAt}
          />
          <InfoRow
            icon={<CalendarClock size={18} aria-hidden />}
            label="신청 마감"
            value={endAt}
          />
          <InfoRow
            icon={<CheckCircle2 size={18} aria-hidden />}
            label="담당기관"
            value={agency}
          />
          <InfoRow
            icon={<WalletCards size={18} aria-hidden />}
            label="분야"
            value={category}
          />
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">공고 개요</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {program.title}은 {category} 분야의 지원사업으로 관련 공고를
            참고하세요. 마감일이 {endAt}으로 설정되어 있으며 마감된 공고는
            기록으로도 열람 가능합니다.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {detailSummary}
          </p>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">신청 체크리스트</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <CheckBlock
              title="자격 조건"
              description="신청 자격 조건과 신청 서류를 미리 확인하세요."
            />
            <CheckBlock
              title="일정 확인"
              description="접수 일정, 마감일, 결과 발표일을 미리 알아두세요."
            />
            <CheckBlock
              title="제출 상태"
              description="지원 정보 기입 후 상태를 재확인하여 빠진 서류를 확인하세요."
            />
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">FAQ</h2>
          <div className="mt-4 space-y-4">
            <FaqItem question="신청 마감일이 지났으면 접수 가능한가요?">
              마감일이 지난 경우 일반적으로 신청이 불가합니다. 추가 모집이 있을
              수 있으니 담당기관에 문의하세요.
            </FaqItem>
            <FaqItem question="필요 서류는 어디서 확인하나요?">
              공고 본문 및 담당기관 홈페이지에서 신청 서류 목록을 확인하시고
              제출하세요.
            </FaqItem>
          </div>
        </section>

        <RelatedProgramList program={program} />

        <section className="py-8">
          <h2 className="text-xl font-bold text-ink">신청 안내</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            마감된 공고도 이후 공고나 유사 공고를 대비해 신청 자격 정보를 미리
            확인하세요.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {canApply ? (
              <TrackableAnchor
                href={program.rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
                label={`${program.slug}-official`}
                eventName="program_apply_clicked"
                eventParams={{
                  content_type: "program",
                  content_id: program.id,
                }}
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
              eventParams={{
                content_type: "program",
                content_id: program.id,
                action: "open_check",
              }}
            >
              체크리스트
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
      <div className="mt-2 text-base font-bold text-ink">{value}</div>
    </div>
  );
}

function CheckBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-line p-4">
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
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
      <h3 className="font-bold text-ink">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{children}</p>
    </article>
  );
}

function ProgramJsonLd({ program }: { program: ProgramListItem }) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/programs/${program.slug}`;
  const publishedAt =
    program.applicationStart?.toISOString() ?? new Date().toISOString();
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
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function FaqPageJsonLd({ program }: { program: ProgramListItem }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${program.title} 신청 마감일이 지났으면 어떻게 되나요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "마감일이 지난 경우 일반적으로 신청이 불가합니다. 추가 모집이나 재공고가 있을 수 있으니 담당기관에 문의하세요.",
        },
      },
      {
        "@type": "Question",
        name: `${program.title} 신청 서류는 어디서 확인하나요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "공고 본문 및 담당기관 홈페이지에서 확인하실 수 있습니다. 공고 바로가기 버튼을 통해 공식 안내 페이지로 이동하세요.",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ program }: { program: ProgramListItem }) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/programs/${program.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "지원사업 공고",
        item: `${siteUrl}/programs`,
      },
      { "@type": "ListItem", position: 3, name: program.title, item: pageUrl },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
