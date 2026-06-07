import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";
import { getSiteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "문의",
  description: "공365 운영, 오류 제보, 콘텐츠 정정 요청 접수 방법을 안내합니다.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const siteName = getSiteName();

  return (
    <LegalPage
      title="문의"
      description={`${siteName} 이용 중 오류, 정정 요청, 제휴 및 운영 관련 문의가 있으면 아래 연락처로 보내 주세요.`}
      sections={[
        {
          title: "연락처",
          body: [
            "이메일: contact@gong365.kr",
            "문의 시 확인이 필요한 페이지 주소, 수정이 필요한 내용, 참고할 수 있는 공식 자료 링크를 함께 보내 주시면 더 정확하게 검토할 수 있습니다.",
          ],
        },
        {
          title: "처리 안내",
          body: [
            "광고, 개인정보, 저작권, 콘텐츠 정정 요청은 접수 후 합리적인 기간 안에 확인합니다.",
            "개별 지원사업의 접수 가능 여부, 선정 결과, 제출 서류 심사는 해당 공고를 운영하는 기관에 직접 확인해야 합니다.",
          ],
        },
      ]}
    />
  );
}
