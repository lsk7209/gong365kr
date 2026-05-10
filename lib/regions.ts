import type { ProgramListItem } from "./programs/display";

export type RegionRow = {
  code: string;
  name: string;
  group: string;
  keywords: readonly string[];
};

export const regionRows = [
  { code: "seoul", name: "서울", group: "수도권", keywords: ["서울", "서울시", "서울특별시", "서울특별자치시"] },
  { code: "gyeonggi", name: "경기도", group: "수도권", keywords: ["경기", "경기도", "경기권"] },
  { code: "incheon", name: "인천", group: "수도권", keywords: ["인천", "인천시", "인천광역시"] },
  { code: "busan", name: "부산", group: "영남권", keywords: ["부산", "부산시", "부산광역시"] },
  { code: "daegu", name: "대구", group: "영남권", keywords: ["대구", "대구시", "대구광역시"] },
  { code: "ulsan", name: "울산", group: "영남권", keywords: ["울산", "울산시", "울산광역시"] },
  { code: "gyeongbuk", name: "경북", group: "영남권", keywords: ["경북", "경상북도"] },
  { code: "gyeongnam", name: "경남", group: "영남권", keywords: ["경남", "경상남도"] },
  { code: "daejeon", name: "대전", group: "충청권", keywords: ["대전", "대전시", "대전광역시"] },
  { code: "sejong", name: "세종", group: "충청권", keywords: ["세종", "세종시", "세종특별자치시"] },
  { code: "chungbuk", name: "충북", group: "충청권", keywords: ["충북", "충북도", "충청북도"] },
  { code: "chungnam", name: "충남", group: "충청권", keywords: ["충남", "충남도", "충청남도"] },
  { code: "gwangju", name: "광주", group: "호남권", keywords: ["광주", "광주시", "광주광역시"] },
  { code: "jeonbuk", name: "전북", group: "호남권", keywords: ["전북", "전라북도", "전북특별자치도"] },
  { code: "jeonnam", name: "전남", group: "호남권", keywords: ["전남", "전라남도", "전남도"] },
  { code: "gangwon", name: "강원", group: "강원권", keywords: ["강원", "강원도", "강원특별자치도"] },
  { code: "jeju", name: "제주", group: "제주권", keywords: ["제주", "제주도", "제주특별자치도"] }
] as const satisfies readonly RegionRow[];

export function findRegionByCode(code: string) {
  return regionRows.find((region) => region.code === code) ?? null;
}

export function findRegionsForProgram(program: Pick<ProgramListItem, "title" | "summaryShort" | "agency" | "executor">) {
  const searchText = [program.title, program.summaryShort ?? "", program.agency ?? "", program.executor ?? ""].join(" ");
  const normalizedText = searchText.toLowerCase();

  return regionRows.filter((region) => region.keywords.some((keyword) => normalizedText.includes(keyword.toLowerCase())));
}
