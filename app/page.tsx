import { ArrowRight, CalendarClock, CheckCircle2, MapPinned, Search } from "lucide-react";
import Link from "next/link";
import { featuredPrograms, regionRows, targetRows } from "@/lib/mock-data";

export default function HomePage() {
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
            <Link href="/deadline/2026/06" className="rounded-md bg-brand px-3 py-2 font-semibold text-white">
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
              {targetRows.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-md bg-white p-3">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm font-bold text-brand">{item.count}건</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">마감 임박 공고</h2>
            <p className="mt-1 text-sm text-slate-600">Sprint 1에서는 목업 데이터로 화면 구조를 검증합니다.</p>
          </div>
          <Link href="/deadline/2026/06" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
            전체 보기
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredPrograms.map((program) => (
            <article key={program.slug} className="rounded-lg border border-line bg-white p-5 shadow-panel">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-brand">{program.category}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-signal">
                  <CalendarClock size={14} aria-hidden />
                  {program.deadline}
                </span>
              </div>
              <h3 className="min-h-14 text-lg font-bold leading-7 text-ink">{program.title}</h3>
              <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{program.summary}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={16} className="text-brand" aria-hidden />
                {program.target}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-xl font-bold text-ink">지역별 탐색 준비 현황</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {regionRows.map((region) => (
              <Link
                key={region.code}
                href={`/regions/${region.code}`}
                className="rounded-lg border border-line p-4 hover:border-brand"
              >
                <span className="text-sm text-slate-500">{region.group}</span>
                <strong className="mt-1 block text-lg text-ink">{region.name}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
