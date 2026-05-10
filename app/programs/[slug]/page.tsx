import { CalendarClock, CheckCircle2, ExternalLink, FileText, WalletCards } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
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
      title: "지원사업 상세",
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

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <ProgramJsonLd program={program} />

        <Link href="/programs" className="text-sm font-semibold text-brand">
          지원사업 목록으로 이동
        </Link>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-brand">{category}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{formatDeadline(program)}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">{program.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{detailSummary}</p>
          {closed ? (
            <p className="mt-4 rounded-lg border border-line bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              이 공고는 신청 마감된 기록입니다. 삭제하지 않고 남겨두어 이전 모집 조건과 유사 공고 확인에 활용할 수 있습니다.
            </p>
          ) : null}
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow icon={<CalendarClock size={18} aria-hidden />} label="접수 시작" value={startAt} />
          <InfoRow icon={<CalendarClock size={18} aria-hidden />} label="접수 마감" value={endAt} />
          <InfoRow icon={<CheckCircle2 size={18} aria-hidden />} label="기관" value={agency} />
          <InfoRow icon={<WalletCards size={18} aria-hidden />} label="유형" value={category} />
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">지원사업 상세 요약</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {program.title}은 {category} 분야의 지원사업입니다. 접수 마감일은 {endAt}이며, 실제 접수 가능 여부와 제출 서류는
            기관 공고문 기준으로 확인해야 합니다.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{detailSummary}</p>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">신청 전 확인할 체크포인트</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <CheckBlock title="자격 조건" description="지원 대상, 업종, 지역, 업력, 매출 조건을 먼저 확인하세요." />
            <CheckBlock title="신청 일정" description="접수 시작일과 마감일, 온라인 또는 오프라인 접수 방식을 확인하세요." />
            <CheckBlock title="제출 서류" description="필수 첨부서류와 제출 양식은 원문 공고 기준으로 준비하세요." />
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">자주 묻는 질문</h2>
          <div className="mt-4 space-y-4">
            <FaqItem question="마감된 공고도 왜 남겨두나요?">
              마감 공고는 다음 모집 시기와 조건을 예측하는 참고 자료가 됩니다. 검색 노출과 내부 링크 흐름을 위해 URL도 유지합니다.
            </FaqItem>
            <FaqItem question="마감 직전 제출도 가능한가요?">
              가능한 경우가 많지만 시스템 지연이나 서류 보완 시간을 고려해 여유 있게 제출하는 편이 안전합니다.
            </FaqItem>
          </div>
        </section>

        <RelatedProgramList program={program} />

        <section className="py-8">
          <h2 className="text-xl font-bold text-ink">다음 단계</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            원문 공고에서 최신 조건을 확인한 뒤, 신청 체크리스트로 자격과 제출 준비 상태를 점검하세요.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={program.rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
            >
              공식 신청 페이지 보기
              <ExternalLink size={16} aria-hidden />
            </a>
            <Link
              href="/check"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              신청 체크
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
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
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
          name: "마감된 공고도 왜 남겨두나요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "마감 공고는 다음 모집 시기와 조건을 예측하는 참고 자료가 되므로 URL을 유지합니다."
          }
        },
        {
          "@type": "Question",
          name: "마감 직전 제출도 가능한가요?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "가능한 경우가 많지만 시스템 지연을 고려해 여유 있게 제출하는 편이 안전합니다."
          }
        }
      ]
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
