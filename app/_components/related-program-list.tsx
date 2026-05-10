import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgramCard } from "@/app/_components/program-card";
import { getProgramCategory, type ProgramListItem } from "@/lib/programs/display";
import { findRegionsForProgram, regionRows } from "@/lib/regions";
import { readProgramData } from "@/lib/programs/page-data";
import { listRelatedPrograms } from "@/lib/programs/query-repository";

const RELATED_PROGRAM_LIMIT = 3;

export async function RelatedProgramList({ program }: { program: ProgramListItem }) {
  const programs = await readProgramData([], (db) => listRelatedPrograms(db, program, RELATED_PROGRAM_LIMIT));
  const titleRegions = [...findRegionsForProgram(program), ...extractRegionMatchesFromTitle(program.title)];
  const fallbackRegions = extractRegionsFromPrograms(programs);
  const relatedRegions = dedupeRegions(titleRegions.length > 0 ? titleRegions : fallbackRegions).slice(0, 2);

  const hasCards = programs.length > 0;
  const hasRegions = relatedRegions.length > 0;

  if (!hasCards && !hasRegions) {
    return null;
  }

  const relatedLinks = [
    {
      href: `/programs?category=${encodeURIComponent(getProgramCategory(program))}`,
      label: "같은 분야 보기"
    },
    ...relatedRegions.map((region) => ({
      href: `/programs?region=${encodeURIComponent(region.code)}`,
      label: `${region.name} 지역 보기`
    }))
  ];

  return (
    <section className="border-b border-line py-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <h2 className="text-xl font-bold text-ink">관련 지원사업</h2>
        <div className="flex flex-wrap gap-3">
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
            >
              {link.label}
              <ArrowRight size={16} aria-hidden />
            </Link>
          ))}
        </div>
      </div>
      {hasCards && (
        <div className="grid gap-4 md:grid-cols-3">
          {programs.map((relatedProgram) => (
            <ProgramCard key={relatedProgram.id} program={relatedProgram} />
          ))}
        </div>
      )}
    </section>
  );
}

function dedupeRegions(regions: Array<ReturnType<typeof findRegionsForProgram>[number]>) {
  return [...new Map(regions.map((region) => [region.code, region])).values()];
}

function extractRegionsFromPrograms(programs: ProgramListItem[]) {
  return dedupeRegions(programs.flatMap((item) => findRegionsForProgram(item)));
}

function extractRegionMatchesFromTitle(title: string) {
  const bracketMatches = Array.from(title.matchAll(/\[(.+?)\]/g)).map((match) => match[1].toLowerCase());

  return regionRows.filter((region) =>
    region.keywords.some((keyword) => {
      const lowerKeyword = keyword.toLowerCase();
      return bracketMatches.some((hint) => hint.includes(lowerKeyword)) || title.toLowerCase().includes(lowerKeyword);
    })
  );
}
