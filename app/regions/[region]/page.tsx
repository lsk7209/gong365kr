import { ArrowRight, MapPinned, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EmptyState } from "@/app/_components/empty-state";
import { ProgramCard } from "@/app/_components/program-card";
import { readProgramData } from "@/lib/programs/page-data";
import {
  listClosedProgramsByRegion,
  listOpenProgramsByRegion
} from "@/lib/programs/query-repository";
import { findRegionByCode, type RegionRow, regionRows } from "@/lib/regions";
import { getSiteUrl } from "@/lib/site";

type RegionPageProps = {
  params: Promise<{
    region: string;
  }>;
};

export const revalidate = 21600;
const REGION_PAGE_LIMIT = 50;
const REGION_CLOSED_PAGE_LIMIT = 30;

export function generateStaticParams() {
  return regionRows.map((region) => ({
    region: region.code
  }));
}

export async function generateMetadata({ params }: RegionPageProps) {
  const { region } = await params;
  const regionRow = findRegionByCode(region);
  const regionName = regionRow?.name ?? "지역";

  return {
    title: `${regionName} 2026 기업 지원사업 공고`,
    description: `${regionName} 기업·예비창업자가 확인할 수 있는 2026 지원사업 공고를 모았습니다. 신청 자격, 마감일, 지원 내용은 원문 공고에서 최종 확인하세요.`,
    alternates: {
      canonical: `/regions/${region}`
    },
    openGraph: {
      title: `${regionName} 2026 기업 지원사업 공고 | 창업머니맵`,
      description: `${regionName} 2026 기업 지원사업 공고를 마감일과 지원 내용 기준으로 확인하세요.`,
      locale: "ko_KR",
      type: "website"
    }
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region } = await params;
  const regionRow = findRegionByCode(region);

  if (!regionRow) {
    notFound();
  }

  const [activePrograms, closedPrograms] = await Promise.all([
    readProgramData([], (db) => listOpenProgramsByRegion(db, regionRow, REGION_PAGE_LIMIT, new Date())),
    readProgramData([], (db) => listClosedProgramsByRegion(db, regionRow, REGION_CLOSED_PAGE_LIMIT, new Date()))
  ]);
  const programCount = activePrograms.length + closedPrograms.length;
  const programListHref = `/programs?region=${regionRow.code}`;

  return (
    <main className="min-h-screen bg-white">
      <RegionJsonLd region={regionRow} programCount={programCount} />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <nav className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand">
            창업머니맵
          </Link>
          <span>/</span>
          <Link href="/regions" className="hover:text-brand">
            지역 목록
          </Link>
        </nav>

        <header className="mt-8 border-b border-line pb-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-1 text-sm font-bold text-brand">
            <MapPinned size={16} aria-hidden />
            {regionRow.group}
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-ink">{regionRow.name} 창업지원금 공고</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            {regionRow.name} 창업지원금 페이지는 지역명이 포함된 마감 전 창업지원사업과 정책자금 공고를 모아 보여줍니다.
            현재 확인 가능한 공고는 {programCount}건입니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={programListHref}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white"
            >
              <Search size={16} aria-hidden />
              {regionRow.name} 공고 필터로 보기
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-3 text-sm font-semibold text-ink"
            >
              전체 지원사업 보기
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </header>

        <section className="grid gap-4 border-b border-line py-8 md:grid-cols-3">
          {[
            ["확인 기준", "공고명·요약·기관명"],
            ["표시 대상", "마감 전 활성 공고"],
            ["정렬 기준", "마감일 가까운 순"]
          ].map(([title, value]) => (
            <div key={title}>
              <div className="text-sm font-semibold text-slate-500">{title}</div>
              <div className="mt-1 text-base font-bold text-ink">{value}</div>
            </div>
          ))}
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">{regionRow.name} 지원사업 확인 포인트</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <GuideBlock title="사업장 소재지" description={`${regionRow.name} 본사, 지점, 공장, 연구소 조건이 있는지 먼저 확인하세요.`} />
            <GuideBlock title="접수 마감" description="예산 소진이나 조기 마감이 있을 수 있어 원문 공고의 접수 상태를 다시 확인해야 합니다." />
            <GuideBlock title="지원 형태" description="사업화 자금, 기술개발, 컨설팅, 인증, 판로 지원처럼 실제 지원 항목을 비교하세요." />
          </div>
        </section>

        <section className="border-b border-line py-8">
          <h2 className="text-xl font-bold text-ink">자주 묻는 질문</h2>
          <div className="mt-4 space-y-4">
            <FaqItem question={`${regionRow.name} 창업지원금은 누가 신청할 수 있나요?`}>
              공고마다 다르지만 보통 {regionRow.name}에 사업장을 두었거나 이전 조건을 충족하는 예비창업자, 창업기업, 중소기업이 대상입니다.
            </FaqItem>
            <FaqItem question="이 페이지의 공고만 보면 충분한가요?">
              아닙니다. 이 페이지는 지역명이 확인되는 공고를 빠르게 모아 보는 용도이며, 신청 전에는 반드시 원문 공고의 자격, 서류, 마감 상태를 확인해야 합니다.
            </FaqItem>
          </div>
        </section>

        {regionRow.code === "jeonnam" ? (
          <section className="border-b border-line py-8" aria-labelledby="jeonnam-check-guide">
            <h2 id="jeonnam-check-guide" className="text-xl font-bold text-ink">
              전남 지원사업 공고, 신청 전 3가지만 확인하세요
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              아래 목록은 전남 관련 공고를 찾는 출발점입니다. 신청 여부는 공고별 원문을 기준으로 판단하세요.
            </p>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              <li className="rounded-lg border border-line p-4">
                <h3 className="font-bold text-ink">1. 현재 모집 중인지</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  접수 기간과 조기 마감 여부를 먼저 확인하고, 마감일은 원문 공고의 기준 시각을 따르세요.
                </p>
              </li>
              <li className="rounded-lg border border-line p-4">
                <h3 className="font-bold text-ink">2. 소재지·업력·업종 조건</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  전남 소재지, 사업장 이전 계획, 업력과 업종 제한이 내 상황에 맞는지 공고문에서 확인하세요.
                </p>
              </li>
              <li className="rounded-lg border border-line p-4">
                <h3 className="font-bold text-ink">3. 서류와 문의처</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  필수 제출 서류와 증빙 기준을 확인한 뒤, 해석이 필요한 조건은 공고의 담당 기관에 문의하세요.
                </p>
              </li>
            </ol>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <GuideBlock
                title="전남에 거주하지만 사업장이 다른 지역이면 신청할 수 있나요?"
                description="공고마다 기준이 다릅니다. 거주지보다 사업장 소재지, 이전 계획, 업력 또는 대표자 요건을 기준으로 보는 경우도 있으므로 원문 공고의 신청 자격과 담당 기관 안내를 함께 확인하세요."
              />
              <GuideBlock
                title="마감 전에 어떤 서류와 업력 기준을 먼저 확인해야 하나요?"
                description="먼저 모집 상태와 마감 시각을 확인한 뒤, 사업자등록 여부와 업력 산정 기준, 소재지 조건, 제출 서류를 원문 공고에서 순서대로 점검하세요. 같은 지원사업이라도 세부 공고에 따라 기준이 달라질 수 있습니다."
              />
            </div>
          </section>
        ) : null}

        <section className="py-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-ink">{regionRow.name} 활성 공고</h2>
            <Link href={programListHref} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
              필터 페이지
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {activePrograms.length > 0 ? (
              activePrograms.map((program) => <ProgramCard key={program.id} program={program} />)
            ) : (
              <EmptyState
                title={`${regionRow.name} 지역 공고가 없습니다`}
                description="지역명이 포함된 활성 공고가 동기화되면 이 목록에 표시됩니다."
              />
            )}
          </div>
          {closedPrograms.length > 0 ? (
            <section className="mt-10" aria-label="마감 공고">
              <h3 className="text-lg font-semibold text-ink">마감 기록</h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {closedPrograms.map((program) => <ProgramCard key={program.id} program={program} />)}
              </div>
            </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function GuideBlock({ title, description }: { title: string; description: string }) {
  return <article className="rounded-lg border border-line p-4"><h3 className="font-bold text-ink">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>;
}

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return <article><h3 className="font-bold text-ink">{question}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></article>;
}

function RegionJsonLd({ region, programCount }: { region: RegionRow; programCount: number }) {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: `${region.name} 창업지원금 공고`,
    url: `${siteUrl}/regions/${region.code}`,
    mainEntity: [
      {
        "@type": "Question",
        name: `${region.name} 창업지원금은 누가 신청할 수 있나요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${region.name}에 사업장을 두었거나 공고별 이전 조건을 충족하는 예비창업자, 창업기업, 중소기업이 신청 대상이 될 수 있습니다.`
        }
      },
      {
        "@type": "Question",
        name: "이 페이지의 공고만 보면 충분한가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `현재 ${programCount}건의 지역 관련 공고를 보여주지만, 신청 전에는 원문 공고의 자격, 서류, 마감 상태를 반드시 확인해야 합니다.`
        }
      }
    ]
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
