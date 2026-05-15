export const KSTARTUP_ENDPOINT =
  "https://apis.data.go.kr/B552735/kisedKstartupService01/getAnnouncementInformation01";

export const DEFAULT_KSTARTUP_PAGE_SIZE = 50;

export const KSTARTUP_REQUEST_HEADERS = {
  "accept-language": "ko-KR,ko;q=0.9",
  "user-agent":
    "Mozilla/5.0 (compatible; Gong365Bot/1.0; +https://www.gong365.kr)",
} as const;

export const KSTARTUP_CATEGORY_MAP: Record<string, string> = {
  창업: "창업",
  기술ㆍR: "기술",
  "R&D": "기술",
  자금: "금융",
  융자: "금융",
  보증: "금융",
  인력: "인력",
  수출ㆍ글로벌: "수출",
  수출: "수출",
  판로ㆍ유통: "내수",
  내수: "내수",
  멘토링ㆍ컨설팅: "경영",
  경영: "경영",
  시설ㆍ공간: "경영",
  보육: "경영",
  행사ㆍ네트워크: "기타",
};
