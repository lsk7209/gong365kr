import { CalendarClock, CheckCircle2, ExternalLink, FileText, WalletCards } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  formatDate,
  formatDeadline,
  getProgramAgency,
  getProgramCategory,
  getProgramSummary,
  type ProgramListItem
} from "@/lib/programs/display";
import { readProgramData } from "@/lib/programs/page-data";
import { getProgramBySlug } from "@/lib/programs/query-repository";
import { getSiteUrl } from "@/lib/site";

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
      title: "창업지원사업 공고",
      alternates: {
        canonical: `/programs/${slug}`
      }
    };
  }

  return {
    title: `${program.title} | 창업지원사업`,
    description: getProgramSummary(program).slice(0, 120),
    alternates: {
      canonical: `/programs/${program.slug}`
    },
    openGraph: {
      title: program.title,
      description: getProgramSummary(program).slice(0, 120),
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

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12">
        <ProgramJsonLd program={program} />
        <Link href="/programs" className="text-sm font-semibold text-brand">
          지원사업 목록
        </Link>

        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-md bg-teal-50 px-2.5 py-1 text-brand">{getProgramCategory(program)}</span>
            <span className="rounded-md bg-amber-50 px-2.5 py-1 text-amber-700">{formatDeadline(program.applicationEnd)}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">{program.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{getProgramSummary(program)}</p>
        </header>

        <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
          <InfoRow icon={<CalendarClock size={18} aria-hidden />} label="신청 시작" value={formatDate(program.applicationStart)} />
          <InfoRow icon={<CalendarClock size={18} aria-hidden />} label="신청 마감" value={formatDate(program.applicationEnd)} />
          <InfoRow icon={<CheckCircle2 size={18} aria-hidden />} label="담당 기관" value={getProgramAgency(program)} />
          <InfoRow icon={<WalletCards size={18} aria-hidden />} label="분야" value={getProgramCategory(program)} />
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">공고 핵심 요약</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <p>{program.title}은 {getProgramCategory(program)} 분야의 창업지원사업 공고입니다.</p>
            <p>{getProgramAgency(program)}에서 확인되는 공고이며, 신청 마감일은 {formatDate(program.applicationEnd)}입니다.</p>
            <p>{getProgramSummary(program)}</p>
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">지원 전 체크포인트</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <CheckBlock title="신청 자격" description="업력, 소재지, 기업 규모, 업종 제한이 공고마다 다르므로 원문 기준으로 확인하세요." />
            <CheckBlock title="제출 서류" description="사업계획서, 증빙서류, 견적서, 인증서류 등 필수 서류 누락 여부를 먼저 점검하세요." />
            <CheckBlock title="마감 상태" description="마감 전이라도 예산 소진, 모집 조기 종료, 기관별 추가 조건이 있을 수 있습니다." />
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">자주 묻는 질문</h2>
          <div className="mt-4 space-y-4">
            <FaqItem question="이 공고는 어디에서 신청하나요?">
              신청 경로와 제출 방식은 원문 공고에서 최종 확인해야 합니다. 아래 원문 공고 보기 버튼으로 기관 공고 페이지를 확인하세요.
            </FaqItem>
            <FaqItem question="마감일만 확인하면 신청해도 되나요?">
              아닙니다. 마감일 외에도 지원 대상, 제외 업종, 소재지 조건, 제출 서류, 예산 소진 여부를 함께 확인해야 합니다.
            </FaqItem>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-xl font-bold text-ink">다음 행동</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            자격 조건을 빠르게 점검한 뒤, 원문 공고에서 신청 방식과 제출 서류를 최종 확인하세요.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={program.rawUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white"
            >
              원문 공고 보기
              <ExternalLink size={16} aria-hidden />
            </a>
            <Link
              href="/check"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink"
            >
              자격 적합성 확인
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
  return <article className="rounded-lg border border-line p-4"><h3 className="font-bold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>;
}

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return <article><h3 className="font-bold text-ink">{question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></article>;
}

function ProgramJsonLd({ program }: { program: ProgramListItem }) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/programs/${program.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: program.title,
        description: getProgramSummary(program),
        url: pageUrl,
        author: { "@type": "Organization", name: getProgramAgency(program) },
        publisher: { "@type": "Organization", name: "창업머니맵" },
        articleSection: getProgramCategory(program),
        datePublished: program.applicationStart?.toISOString(),
        dateModified: program.applicationEnd?.toISOString()
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "이 공고는 어디에서 신청하나요?",
            acceptedAnswer: { "@type": "Answer", text: "신청 경로와 제출 방식은 원문 공고에서 최종 확인해야 합니다." }
          },
          {
            "@type": "Question",
            name: "마감일만 확인하면 신청해도 되나요?",
            acceptedAnswer: { "@type": "Answer", text: "마감일 외에도 지원 대상, 제외 업종, 소재지 조건, 제출 서류, 예산 소진 여부를 함께 확인해야 합니다." }
          }
        ]
      }
    ]
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
