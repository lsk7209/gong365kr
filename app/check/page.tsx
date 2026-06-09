import {
  ClipboardCheck,
  MapPin,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "gong365.kr 자격 적합도 체크",
  description:
    "gong365.kr 창업지원사업 자격 적합도 체크 — 창업 단계, 지역, 업종, 매출 규모를 입력해 맞춤 지원사업을 빠르게 확인하세요.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/check",
  },
  openGraph: {
    title: "gong365.kr 자격 적합도 체크",
    description:
      "gong365.kr 창업지원사업 자격 적합도 체크 — 창업 단계, 지역, 업종, 매출 규모로 맞춤 지원사업을 빠르게 확인하세요.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function CheckPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm font-semibold text-brand">
          창업머니맵 (gong365.kr)
        </Link>

        <div className="mt-8 rounded-lg border border-line bg-slate-50 p-6">
          <ClipboardCheck className="text-brand" size={32} aria-hidden />
          <h1 className="mt-4 text-3xl font-bold text-ink">자격 적합도 체크</h1>
          <p className="mt-3 leading-7 text-slate-600">
            창업 단계, 나이대, 지역, 업종, 회사 형태, 매출 규모를 입력하면
            gong365.kr에 등록된 지원사업 중 신청 가능한 공고를 자동으로 필터링해
            보여주는 맞춤 탐색 기능입니다. 현재 개발 중이며 다음 업데이트에서
            공개됩니다.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-ink">
            어떤 정보를 입력하나요?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            자격 적합도 체크는 지원사업마다 다른 신청 조건을 빠르게 대조하기
            위해 설계됩니다. 일반적으로 창업 지원사업은 창업 후 경과 기간,
            사업자 유형, 주소지 기준 지역, 업종 코드, 직원 수, 연 매출액 등을
            주요 자격 조건으로 사용합니다.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <CheckItem
              icon={<Building2 size={18} />}
              label="창업 단계"
              description="예비창업·초기(3년 이내)·도약(7년 이내) 등 단계별 필터"
            />
            <CheckItem
              icon={<MapPin size={18} />}
              label="지역"
              description="서울·경기·부산 등 17개 광역시도 기준 지역 매칭"
            />
            <CheckItem
              icon={<TrendingUp size={18} />}
              label="업종·분야"
              description="제조·IT·서비스·소셜벤처 등 분야별 지원 여부 확인"
            />
            <CheckItem
              icon={<Calendar size={18} />}
              label="매출·고용 규모"
              description="연 매출 및 상시 직원 수 기준 소기업·중기업 구분"
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-ink">
            왜 자격 조건을 미리 확인해야 하나요?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            창업지원사업은 공고마다 신청 자격이 다릅니다. 예를 들어
            중소벤처기업부 공고는 창업 7년 이내 법인 또는 개인사업자를 대상으로
            하지만, 지자체 창업 지원은 예비창업자나 창업 3년 이내만 허용하는
            경우가 많습니다. 사전에 자신의 상황을 체크하면 자격 미달 공고에
            시간을 낭비하지 않고 실제로 신청 가능한 공고에 집중할 수 있습니다.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            gong365.kr 자격 적합도 체크 기능이 완성되면 공고 목록에서 내 조건에
            맞는 공고만 필터링하거나, 각 공고 상세 페이지에서 내 자격 여부를
            즉시 확인할 수 있게 됩니다. 현재는 원문 공고 링크를 통해 직접
            확인하는 방식으로 이용할 수 있습니다.
          </p>
        </section>

        <div className="mt-10 rounded-lg border border-brand/20 bg-brand/5 p-5">
          <p className="text-sm leading-7 text-slate-700">
            지금 바로 지원사업을 탐색하려면{" "}
            <Link
              href="/programs"
              className="font-semibold text-brand underline underline-offset-2"
            >
              공고 전체 보기
            </Link>
            에서 지역·분야별로 필터링하거나,{" "}
            <Link
              href="/regions"
              className="font-semibold text-brand underline underline-offset-2"
            >
              지역별 탐색
            </Link>
            에서 관심 지역 공고만 모아볼 수 있습니다.
          </p>
        </div>
      </section>
    </main>
  );
}

function CheckItem({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-line bg-white p-4">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        <strong className="block text-sm font-semibold text-ink">
          {label}
        </strong>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
