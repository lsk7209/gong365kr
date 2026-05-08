import Link from "next/link";
import { regionRows } from "@/lib/mock-data";

export const metadata = {
  title: "지역별 창업지원금",
  description: "지역별 창업지원사업 탐색을 준비 중인 페이지입니다."
};

export default function RegionsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Link href="/" className="text-sm font-semibold text-brand">
          창업머니맵
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-ink">지역별 창업지원금</h1>
        <p className="mt-3 text-slate-600">기업마당 sync 이후 지역별 활성 공고를 연결합니다.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>
    </main>
  );
}
