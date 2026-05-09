import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/app/_components/empty-state";
import { ProgramCard } from "@/app/_components/program-card";
import { readProgramData } from "@/lib/programs/page-data";
import { listProgramsByRegion } from "@/lib/programs/query-repository";
import { findRegionByCode, regionRows } from "@/lib/regions";

type RegionPageProps = {
  params: Promise<{
    region: string;
  }>;
};

export const revalidate = 3600;
const REGION_PAGE_LIMIT = 50;

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
    title: `${regionName} 창업지원금`,
    description: `${regionName} 지역에서 확인되는 창업지원사업 공고를 모았습니다.`,
    alternates: {
      canonical: `/regions/${region}`
    }
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region } = await params;
  const regionRow = findRegionByCode(region);

  if (!regionRow) {
    notFound();
  }

  const programs = await readProgramData([], (db) => listProgramsByRegion(db, regionRow, REGION_PAGE_LIMIT));

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Link href="/regions" className="text-sm font-semibold text-brand">
          지역 목록
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-ink">{regionRow.name} 창업지원금</h1>
        <p className="mt-3 leading-7 text-slate-600">
          공고명, 요약, 주관기관, 수행기관에 {regionRow.name} 지역명이 포함된 활성 공고입니다.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {programs.length > 0 ? (
            programs.map((program) => <ProgramCard key={program.id} program={program} />)
          ) : (
            <EmptyState
              title={`${regionRow.name} 지역 공고가 없습니다`}
              description="지역명이 포함된 활성 공고가 동기화되면 이 목록에 표시됩니다."
            />
          )}
        </div>
      </section>
    </main>
  );
}
