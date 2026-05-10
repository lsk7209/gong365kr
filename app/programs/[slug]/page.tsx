import { CalendarClock, CheckCircle2, ExternalLink, FileText, WalletCards } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  formatDate,
  formatDeadline,
  getProgramAgency,
  getProgramCategory,
  getProgramSummary
} from "@/lib/programs/display";
import { readProgramData } from "@/lib/programs/page-data";
import { getProgramBySlug } from "@/lib/programs/query-repository";

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

        <section className="py-8">
          <h2 className="text-xl font-bold text-ink">확인할 내용</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <p>이 공고는 {getProgramCategory(program)} 분야의 창업지원사업입니다.</p>
            <p>신청 마감일은 {formatDate(program.applicationEnd)}이며, 세부 자격과 제출서류는 원문 공고에서 최종 확인해야 합니다.</p>
            <p>마감 전이라도 예산 소진, 모집 조기 종료, 기관별 추가 조건이 있을 수 있습니다.</p>
          </div>
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
