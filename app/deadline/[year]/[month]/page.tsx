import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/app/_components/empty-state";
import { ProgramCard } from "@/app/_components/program-card";
import { readProgramData } from "@/lib/programs/page-data";
import {
  listClosedProgramsByDeadlineMonth,
  listOpenProgramsByDeadlineMonth,
} from "@/lib/programs/query-repository";

type DeadlinePageProps = {
  params: Promise<{
    year: string;
    month: string;
  }>;
};

export const revalidate = 3600;
const DEADLINE_PAGE_LIMIT = 50;
const DEADLINE_CLOSED_PAGE_LIMIT = 30;

export async function generateMetadata({ params }: DeadlinePageProps) {
  const { year, month } = await params;

  return {
    title: `${year}년 ${month}월 마감 창업지원금 | 창업머니맵`,
    description: `${year}년 ${month}월에 신청이 마감되는 창업지원사업 공고와 마감 기록을 확인하세요.`,
    alternates: {
      canonical: `/deadline/${year}/${month}`,
    },
    openGraph: {
      title: `${year}년 ${month}월 마감 창업지원금`,
      description: `${year}년 ${month}월에 신청이 마감되는 창업지원사업 공고와 마감 기록을 확인하세요.`,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default async function DeadlinePage({ params }: DeadlinePageProps) {
  const { year, month } = await params;
  const parsedYear = Number(year);
  const parsedMonth = Number(month);

  if (!isValidDeadlineParams(parsedYear, parsedMonth)) {
    notFound();
  }

  const [activePrograms, closedPrograms] = await Promise.all([
    readProgramData([], (db) =>
      listOpenProgramsByDeadlineMonth(
        db,
        parsedYear,
        parsedMonth,
        DEADLINE_PAGE_LIMIT,
        new Date(),
      ),
    ),
    readProgramData([], (db) =>
      listClosedProgramsByDeadlineMonth(
        db,
        parsedYear,
        parsedMonth,
        DEADLINE_CLOSED_PAGE_LIMIT,
        new Date(),
      ),
    ),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Link href="/" className="text-sm font-semibold text-brand">
          창업머니맵
        </Link>
        <header className="mt-8 rounded-lg border border-line bg-slate-50 p-6">
          <CalendarClock className="text-signal" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-bold text-ink">
            {year}년 {month}월 마감 창업지원금
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            해당 월에 신청 접수가 끝나는 공고를 마감일 기준으로 정리했습니다.
            이미 마감된 공고도 기록으로 유지합니다.
          </p>
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {activePrograms.length > 0 ? (
            activePrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))
          ) : (
            <EmptyState
              title="해당 월 마감 공고가 없습니다"
              description="DB에 해당 월 마감일이 저장된 공고가 있으면 이 목록에 표시됩니다."
            />
          )}
        </div>
        {closedPrograms.length > 0 ? (
          <section className="mt-10" aria-label="마감 공고">
            <h2 className="text-lg font-semibold text-ink">마감 기록</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {closedPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function isValidDeadlineParams(year: number, month: number) {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    year >= 2020 &&
    year <= 2100 &&
    month >= 1 &&
    month <= 12
  );
}
