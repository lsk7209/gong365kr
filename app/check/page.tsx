import { ClipboardCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "자격 적합도 체크 | 창업머니맵",
  description:
    "창업 단계, 지역, 업종을 입력해 지원사업 적합도를 확인하는 기능 예정 페이지입니다.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/check",
  },
  openGraph: {
    title: "자격 적합도 체크 | 창업머니맵",
    description:
      "창업 단계, 지역, 업종을 입력해 지원사업 적합도를 확인하는 기능 예정 페이지입니다.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function CheckPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm font-semibold text-brand">
          창업머니맵
        </Link>
        <div className="mt-8 rounded-lg border border-line bg-slate-50 p-6">
          <ClipboardCheck className="text-brand" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-bold text-ink">자격 적합도 체크</h1>
          <p className="mt-3 leading-7 text-slate-600">
            사업 단계, 나이대, 성별, 지역, 업종, 회사 형태, 매출 규모를 입력해
            적합한 지원사업을 찾는 기능을 다음 단계에서 구현합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
