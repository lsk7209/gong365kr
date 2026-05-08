const CATEGORY_MAP: Record<string, string> = {
  창업: "changup",
  금융: "finance",
  기술: "tech",
  인력: "hr",
  수출: "export",
  내수: "domestic",
  경영: "business",
  기타: "etc"
};

const KOREAN_TOKEN_MAP: Record<string, string> = {
  예비창업: "yebi-changup",
  초기창업: "chogi-changup",
  창업: "changup",
  패키지: "package",
  청년: "youth",
  여성: "women",
  재창업: "restart",
  소상공인: "small-business",
  정책자금: "policy-fund",
  지원: "support",
  모집: "recruit",
  사업: "program"
};

export function createProgramSlug(input: {
  categoryCode: string | null;
  title: string;
  year: number;
  pblancId: string;
}) {
  const category = CATEGORY_MAP[input.categoryCode ?? ""] ?? "program";
  const titleSlug = createTitleSlug(input.title);
  const fallbackId = input.pblancId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const stableTitle = titleSlug || fallbackId || "notice";

  return `${category}-${stableTitle}-${input.year}`;
}

function createTitleSlug(title: string) {
  const mapped = Object.entries(KOREAN_TOKEN_MAP)
    .filter(([keyword]) => title.includes(keyword))
    .map(([, value]) => value)
    .join("-");

  const ascii = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return [mapped, ascii].filter(Boolean).join("-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}
