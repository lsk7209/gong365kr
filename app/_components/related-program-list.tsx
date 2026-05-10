import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgramCard } from "@/app/_components/program-card";
import { getProgramCategory, type ProgramListItem } from "@/lib/programs/display";
import { readProgramData } from "@/lib/programs/page-data";
import { listRelatedPrograms } from "@/lib/programs/query-repository";

const RELATED_PROGRAM_LIMIT = 3;

export async function RelatedProgramList({ program }: { program: ProgramListItem }) {
  const programs = await readProgramData([], (db) => listRelatedPrograms(db, program, RELATED_PROGRAM_LIMIT));

  if (programs.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-line py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-ink">관련 지원사업</h2>
        <Link
          href={`/programs?category=${encodeURIComponent(getProgramCategory(program))}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
        >
          같은 분야 보기
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {programs.map((relatedProgram) => (
          <ProgramCard key={relatedProgram.id} program={relatedProgram} />
        ))}
      </div>
    </section>
  );
}
