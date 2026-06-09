import Link from "next/link";
import { readProgramData } from "@/lib/programs/page-data";
import { countProgramsByRegions } from "@/lib/programs/query-repository";
import { regionRows } from "@/lib/regions";

export const metadata = {
  title: "gong365.kr 지역별 창업지원금 공고",
  description:
    "gong365.kr에서 서울·경기·부산 등 전국 17개 지역별 창업지원사업 공고를 비교하세요. 지역 기반 정책자금과 공고 수를 한눈에 확인할 수 있습니다.",
  alternates: {
    canonical: "/regions",
  },
  openGraph: {
    title: "gong365.kr 지역별 창업지원금 공고",
    description:
      "gong365.kr에서 서울·경기·부산 등 전국 17개 지역별 창업지원사업 공고를 비교하세요.",
    locale: "ko_KR",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function RegionsPage() {
  const regionCounts = await readProgramData([], (db) =>
    countProgramsByRegions(db, regionRows),
  );
  const regionCountMap = new Map(
    regionCounts.map((item) => [item.code, item.count]),
  );

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-ink">지역별 창업지원금</h1>
        <p className="mt-3 text-slate-600">
          gong365.kr에서 동기화된 창업지원사업 공고를 지역별로 분류했습니다.
          서울, 경기, 부산 등 전국 17개 광역시도의 공고 수를 비교하고, 관심
          지역의 지원사업을 빠르게 탐색하세요.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {regionRows.map((region) => (
            <Link
              key={region.code}
              href={`/regions/${region.code}`}
              className="rounded-lg border border-line p-4 hover:border-brand"
            >
              <span className="text-sm text-slate-500">{region.group}</span>
              <strong className="mt-1 block text-lg text-ink">
                {region.name}
              </strong>
              <span className="mt-2 block text-sm font-semibold text-brand">
                {regionCountMap.get(region.code) ?? 0}건
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-ink">
            지역별 공고, 왜 구분해야 하나요?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            창업지원사업은 중앙부처(중소벤처기업부·고용노동부 등)와
            지방자치단체가 각각 운영합니다. 지자체 공고는 사업자 주소지나 사업장
            소재지가 해당 지역이어야 신청 가능한 경우가 많아, 내 지역에 맞는
            공고를 먼저 확인하는 것이 효율적입니다.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            예를 들어 서울시는 청년창업사관학교, 서울형 강소기업 지원, 서울
            혁신형 창업 패키지 등 자체 프로그램을 운영하며, 경기도는 경기도 지역
            특화 창업 펀드와 스케일업 지원, 부산은 해양·물류 특화 스타트업
            지원사업을 별도로 운영합니다. gong365.kr은 이러한 공고를 지역 키워드
            기준으로 자동 분류하여 한 화면에서 비교할 수 있도록 합니다.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-ink">
            지역 탐색 이용 방법
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-600">
            <li>위 목록에서 관심 지역을 선택하세요.</li>
            <li>해당 지역 공고 목록에서 마감일·모집 상태를 확인합니다.</li>
            <li>공고 제목을 클릭하면 원문 공고 페이지로 이동합니다.</li>
            <li>마감된 공고도 이전 모집 조건 참고용으로 보관됩니다.</li>
          </ol>
        </section>
      </section>
    </main>
  );
}
