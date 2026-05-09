const EVENT_TYPE_MAP: Record<string, string> = {
  "사업설명회": "briefing",
  "교육": "education",
  "세미나": "seminar",
  "전시회": "expo",
  "상담회": "consulting"
};

const AREA_MAP: Record<string, string> = {
  "전국": "nationwide",
  "서울": "seoul",
  "부산": "busan",
  "대구": "daegu",
  "인천": "incheon",
  "광주": "gwangju",
  "대전": "daejeon",
  "울산": "ulsan",
  "세종": "sejong",
  "경기": "gyeonggi",
  "강원": "gangwon",
  "충북": "chungbuk",
  "충남": "chungnam",
  "전북": "jeonbuk",
  "전남": "jeonnam",
  "경북": "gyeongbuk",
  "경남": "gyeongnam",
  "제주": "jeju"
};

export function createEventSlug(input: {
  eventInfoId: string;
  title: string;
  eventType: string | null;
  areaName: string | null;
  year: number;
}) {
  const type = EVENT_TYPE_MAP[input.eventType ?? ""] ?? "event";
  const area = AREA_MAP[input.areaName ?? ""] ?? "area";
  const titleSlug = createTitleSlug(input.title);
  const stableId = input.eventInfoId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return `${type}-${area}-${titleSlug || "notice"}-${input.year}-${stableId || "event"}`;
}

function createTitleSlug(title: string) {
  return title
    .replace(/^\[[^\]]+\]\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/[가-힣]/g, "")
    .replace(/^-|-$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}
