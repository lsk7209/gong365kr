import type { ProgramStatus } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CATEGORY = "지원사업";
const DEFAULT_SUMMARY = "상세 내용은 원문 공고에서 확인할 수 있습니다.";
const DEFAULT_AGENCY = "공고 기관 확인 필요";
export const PROGRAM_CATEGORY_LABELS = ["창업", "금융", "기술", "인력", "수출", "내수", "경영", "기타"] as const;

export type ProgramListItem = {
  id: number;
  slug: string;
  title: string;
  summaryShort: string | null;
  agency: string | null;
  executor: string | null;
  categoryCode: string | null;
  applicationStart: Date | null;
  applicationEnd: Date | null;
  status: ProgramStatus;
  rawUrl: string;
};

export function getProgramCategory(program: Pick<ProgramListItem, "categoryCode">) {
  return isKnownProgramCategory(program.categoryCode) ? program.categoryCode : DEFAULT_CATEGORY;
}

export function isKnownProgramCategory(value: string | null | undefined): value is (typeof PROGRAM_CATEGORY_LABELS)[number] {
  return PROGRAM_CATEGORY_LABELS.includes(value as (typeof PROGRAM_CATEGORY_LABELS)[number]);
}

export function getProgramSummary(program: Pick<ProgramListItem, "summaryShort">) {
  return program.summaryShort ?? DEFAULT_SUMMARY;
}

export function getProgramAgency(program: Pick<ProgramListItem, "agency" | "executor">) {
  return program.executor ?? program.agency ?? DEFAULT_AGENCY;
}

export function isProgramClosed(program: Pick<ProgramListItem, "applicationEnd" | "status">, now = new Date()) {
  if (program.status === "closed") {
    return true;
  }

  return Boolean(program.applicationEnd && startOfDay(program.applicationEnd).getTime() < startOfDay(now).getTime());
}

export function formatDeadline(program: Pick<ProgramListItem, "applicationEnd" | "status">, now = new Date()) {
  if (isProgramClosed(program, now)) {
    return "마감";
  }

  if (!program.applicationEnd) {
    return "상시";
  }

  const today = startOfDay(now).getTime();
  const deadline = startOfDay(program.applicationEnd).getTime();
  const daysLeft = Math.ceil((deadline - today) / DAY_MS);

  if (daysLeft === 0) {
    return "오늘 마감";
  }

  return `D-${daysLeft}`;
}

export function formatDate(date: Date | null) {
  if (!date) {
    return "상시";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul"
  }).format(date);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
