export type RegionRow = {
  code: string;
  name: string;
  group: string;
  keywords: readonly string[];
};

export const regionRows = [
  { code: "seoul", name: "서울", group: "수도권", keywords: ["서울", "서울특별시"] },
  { code: "gyeonggi", name: "경기도", group: "수도권", keywords: ["경기", "경기도"] },
  { code: "busan", name: "부산", group: "영남권", keywords: ["부산", "부산광역시"] },
  { code: "daejeon", name: "대전", group: "충청권", keywords: ["대전", "대전광역시"] }
] as const satisfies readonly RegionRow[];

export function findRegionByCode(code: string) {
  return regionRows.find((region) => region.code === code) ?? null;
}
