import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";
import { getSiteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "소개",
  description: "공365의 운영 목적과 콘텐츠 작성 기준을 안내합니다.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const siteName = getSiteName();

  return (
    <LegalPage
      title="소개"
      description={`${siteName}는 창업지원사업, 정책자금, 지역별 공고와 행사 정보를 한곳에서 확인할 수 있도록 정리하는 정보형 웹사이트입니다.`}
      sections={[
        {
          title: "운영 목적",
          body: [
            "지원사업 공고는 기관, 지역, 모집 기간, 신청 조건이 자주 바뀝니다. 공365는 방문자가 여러 공고를 빠르게 비교하고 다음 행동을 결정할 수 있도록 핵심 정보를 구조화해 제공합니다.",
            "사이트의 글과 목록은 단순 링크 모음이 아니라 신청 대상, 준비 서류, 일정 확인 포인트처럼 실제 검토에 필요한 맥락을 함께 전달하는 것을 목표로 합니다.",
          ],
        },
        {
          title: "콘텐츠 기준",
          body: [
            "게시물은 명확한 제목, 확인 가능한 기준, 단계별 설명을 중심으로 작성합니다. 오래된 정보나 마감 정보는 주기적으로 점검해 방문자가 혼동하지 않도록 관리합니다.",
            "최종 신청 조건과 제출 방식은 각 운영 기관의 공식 공고가 기준입니다. 공365는 빠른 탐색과 이해를 돕는 보조 정보 채널로 운영됩니다.",
          ],
        },
      ]}
    />
  );
}
