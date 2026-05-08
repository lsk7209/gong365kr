import { CalendarClock } from "lucide-react";
import Link from "next/link";

type DeadlinePageProps = {
  params: Promise<{
    year: string;
    month: string;
  }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: DeadlinePageProps) {
  const { year, month } = await params;

  return {
    title: `${year}년 ${month}월 마감 창업지원금`,
    description: `${year}년 ${month}월 마감 예정 창업지원사업 탐색 페이지입니다.`
  };
}

export default async function DeadlinePage({ params }: DeadlinePageProps) {
  const { year, month } = await params;

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/" className="text-sm font-semibold text-brand">
          창업머니맵
        </Link>
        <div className="mt-8 rounded-lg border border-line bg-slate-50 p-6">
          <CalendarClock className="text-signal" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-bold text-ink">
            {year}년 {month}월 마감 창업지원금
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            마감 임박 공고 정렬은 Bizinfo sync와 status refresh 기능 구현 후 실제 데이터로 연결합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
