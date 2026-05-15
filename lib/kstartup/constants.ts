export const KSTARTUP_ENDPOINT =
  "https://apis.data.go.kr/B552735/kisedSrvcInfo01/getKisedSrvcInfo01";

export const DEFAULT_KSTARTUP_PAGE_SIZE = 50;

export const KSTARTUP_REQUEST_HEADERS = {
  "accept-language": "ko-KR,ko;q=0.9",
  "user-agent":
    "Mozilla/5.0 (compatible; Gong365Bot/1.0; +https://www.gong365.kr)",
} as const;

export const KSTARTUP_CATEGORY_MAP: Record<string, string> = {
  창업: "창업",
  기술: "기술",
  금융: "금융",
  인력: "인력",
  수출: "수출",
  내수: "내수",
  경영: "경영",
};
