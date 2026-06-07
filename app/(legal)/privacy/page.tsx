import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";
import { getSiteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "공365의 개인정보 처리와 광고 쿠키 사용 고지를 안내합니다.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  const siteName = getSiteName();

  return (
    <LegalPage
      title="개인정보처리방침"
      description={`${siteName}는 방문자의 개인정보 보호를 중요하게 생각하며, 사이트 운영과 서비스 개선에 필요한 범위에서 정보를 처리합니다.`}
      sections={[
        {
          title: "수집하는 정보",
          body: [
            "사이트 접속 과정에서 IP 주소, 브라우저 정보, 방문 일시, 참조 URL, 쿠키 정보와 같은 기술적 정보가 서버 로그 또는 분석 도구를 통해 처리될 수 있습니다.",
            "문의 메일을 보내는 경우 답변과 사실 확인을 위해 이메일 주소와 문의 내용이 처리될 수 있습니다.",
          ],
        },
        {
          title: "쿠키와 광고",
          body: [
            "Google을 포함한 제3자 광고 사업자는 쿠키를 사용해 사용자의 이전 방문 기록을 바탕으로 광고를 게재할 수 있습니다.",
            "Google의 광고 쿠키 사용은 사용자가 이 사이트와 다른 사이트를 방문한 정보를 바탕으로 더 관련성 높은 광고를 제공하는 데 사용될 수 있습니다.",
            "사용자는 Google 광고 설정 페이지에서 개인 맞춤 광고를 관리하거나 선택 해제할 수 있습니다. 제3자 광고 네트워크의 쿠키 사용에 대해서도 해당 사업자가 제공하는 선택 해제 기능을 이용할 수 있습니다.",
          ],
        },
        {
          title: "정보 이용 목적",
          body: [
            "수집된 정보는 사이트 보안, 오류 분석, 콘텐츠 품질 개선, 방문 통계 확인, 광고 운영을 위해 사용됩니다.",
            "개인정보 관련 문의는 contact@gong365.kr 으로 접수할 수 있습니다.",
          ],
        },
      ]}
    />
  );
}
