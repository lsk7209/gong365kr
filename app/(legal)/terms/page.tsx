import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";
import { getSiteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용약관",
  description: "공365 이용 조건과 콘텐츠 안내, 면책 사항을 안내합니다.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  const siteName = getSiteName();

  return (
    <LegalPage
      title="이용약관"
      description={`본 약관은 ${siteName} 이용과 관련해 사이트 운영자와 방문자 사이의 기본 사항을 정합니다.`}
      sections={[
        {
          title: "서비스 이용",
          body: [
            "방문자는 이 사이트의 콘텐츠를 개인적인 정보 확인 목적으로 이용할 수 있습니다.",
            "사이트의 콘텐츠를 무단 복제, 대량 수집, 재배포하거나 서비스 운영을 방해하는 행위는 제한됩니다.",
          ],
        },
        {
          title: "콘텐츠 안내",
          body: [
            "이 사이트의 글은 일반 정보 제공을 목적으로 하며, 지원 조건과 제출 방식은 각 운영 기관의 공식 공고를 기준으로 최종 확인해야 합니다.",
            "공고 일정, 예산, 접수 방식은 운영 기관 사정에 따라 변경될 수 있습니다.",
          ],
        },
        {
          title: "광고와 외부 링크",
          body: [
            "사이트에는 광고와 외부 링크가 포함될 수 있습니다. 외부 사이트의 콘텐츠, 정책, 거래 조건은 해당 사이트의 책임과 기준에 따릅니다.",
            "운영자는 콘텐츠의 정확성과 최신성을 높이기 위해 노력하지만, 정보 이용 결과에 대해 법적으로 허용되는 범위를 넘어 보증하지 않습니다.",
          ],
        },
      ]}
    />
  );
}
