export const featuredPrograms = [
  {
    slug: "startup-package-2026",
    title: "예비창업패키지 창업사업화 지원",
    summary: "혁신 아이디어를 가진 예비창업자를 대상으로 사업화 자금과 멘토링을 함께 지원하는 대표 공고입니다.",
    category: "창업",
    deadline: "D-12",
    target: "예비창업자"
  },
  {
    slug: "youth-startup-school-2026",
    title: "청년창업사관학교 입교생 모집",
    summary: "청년 창업자의 제품 개발, 시장 검증, 투자 연계를 단계별로 지원하는 성장형 프로그램입니다.",
    category: "청년",
    deadline: "D-18",
    target: "만 39세 이하"
  },
  {
    slug: "local-small-business-fund-2026",
    title: "지역 소상공인 정책자금 융자",
    summary: "지역 기반 소상공인의 운영 안정과 시설 개선을 위한 정책자금 공고를 비교 확인합니다.",
    category: "금융",
    deadline: "D-25",
    target: "소상공인"
  }
] as const;

export const targetRows = [
  { label: "예비창업자", count: 42 },
  { label: "초기창업기업", count: 58 },
  { label: "청년창업", count: 31 },
  { label: "여성창업", count: 14 }
] as const;

export const regionRows = [
  { code: "seoul", name: "서울", group: "수도권" },
  { code: "gyeonggi", name: "경기도", group: "수도권" },
  { code: "busan", name: "부산", group: "영남권" },
  { code: "daejeon", name: "대전", group: "충청권" }
] as const;
