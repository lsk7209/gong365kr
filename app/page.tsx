import { ArrowRight, MapPinned, Search } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "./_components/empty-state";
import { ProgramCard } from "./_components/program-card";
import { readProgramData } from "@/lib/programs/page-data";
import { countActiveProgramsByCategory, countProgramsByRegions, listClosingPrograms } from "@/lib/programs/query-repository";
import { regionRows } from "@/lib/regions";

const HOME_PROGRAM_LIMIT = 3;
const HOME_CATEGORY_LIMIT = 4;

export const revalidate = 3600;

export default async function HomePage() {
  const [closingPrograms, categoryRows, regionCounts] = await Promise.all([
    readProgramData([], (db) => listClosingPrograms(db, HOME_PROGRAM_LIMIT)),
    readProgramData([], (db) => countActiveProgramsByCategory(db, HOME_CATEGORY_LIMIT)),
    readProgramData([], (db) => countProgramsByRegions(db, regionRows))
  ]);
  const deadlineHref = createDeadlineHref(closingPrograms[0]?.applicationEnd ?? new Date());
  const regionCountMap = new Map(regionCounts.map((item) => [item.code, item.count]));

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-ink">
            창업머니맵
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/check" className="hidden rounded-md px-3 py-2 hover:bg-slate-100 sm:inline-flex">
              적합도 체크
            </Link>
            <Link href={deadlineHref} className="rounded-md bg-brand px-3 py-2 font-semibold text-white">
              마감 공고
            </Link>
          </div>
        </nav>
      </header>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-3 text-sm font-semibold text-brand">정부·지자체 창업자금 통합 탐색</p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-normal text-ink sm:text-5xl">
              내가 신청할 수 있는 창업지원금을 빠르게 찾습니다
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              창업 단계, 지역, 업종, 마감일을 기준으로 지원사업을 정리하고 원공고 확인까지 이어지는 정보형 서비스입니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/check"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white"
              >
                <Search size={18} aria-hidden />
                자격 적합도 확인
              </Link>
              <Link
                href="/regions"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink"
              >
                <MapPinned size={18} aria-hidden />
                지역별 보기
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-line bg-slate-50 p-5 shadow-panel">
            <h2 className="text-base font-bold text-ink">이번 주 우선 확인 항목</h2>
            <div className="mt-4 space-y-3">
              {categoryRows.length > 0 ? categoryRows.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-md bg-white p-3">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm font-bold text-brand">{item.count}건</span>
                </div>
              )) : (
                <div className="rounded-md bg-white p-3 text-sm leading-6 text-slate-600">
                  동기화된 활성 공고가 있으면 분야별 건수가 표시됩니다.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">마감 임박 공고</h2>
            <p className="mt-1 text-sm text-slate-600">실제 동기화된 공고 중 마감일이 가까운 지원사업입니다.</p>
          </div>
          <Link href={deadlineHref} className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
            전체 보기
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        {closingPrograms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {closingPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <EmptyState title="표시할 마감 공고가 없습니다" description="DB 동기화가 완료되면 마감일이 가까운 공고가 이 영역에 표시됩니다." />
        )}
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-xl font-bold text-ink">지역별 활성 공고</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>
    </main>
  );
}

function createDeadlineHref(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `/deadline/${year}/${month}`;
}
