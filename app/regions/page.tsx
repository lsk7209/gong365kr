import Link from "next/link";
import { readProgramData } from "@/lib/programs/page-data";
import { countProgramsByRegions } from "@/lib/programs/query-repository";
import { regionRows } from "@/lib/regions";

export const metadata = {
  title: "지역별 창업지원금",
  description: "지역별로 동기화된 창업지원사업 공고를 확인하세요.",
  alternates: {
    canonical: "/regions"
  }
};

export const revalidate = 3600;

export default async function RegionsPage() {
  const regionCounts = await readProgramData([], (db) => countProgramsByRegions(db, regionRows));
  const regionCountMap = new Map(regionCounts.map((item) => [item.code, item.count]));

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-ink">지역별 창업지원금</h1>
        <p className="mt-3 text-slate-600">동기화된 공고에서 지역명이 확인되는 활성 지원사업을 모았습니다.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {regionRows.map((region) => (
            <Link
              key={region.code}
              href={`/regions/${region.code}`}
              className="rounded-lg border border-line p-4 hover:border-brand"
            >
              <span className="text-sm text-slate-500">{region.group}</span>
              <strong className="mt-1 block text-lg text-ink">{region.name}</strong>
              <span className="mt-2 block text-sm font-semibold text-brand">
                {regionCountMap.get(region.code) ?? 0}건
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
