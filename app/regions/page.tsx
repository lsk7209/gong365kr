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
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-xl font-semibold text-ink">
            지역별 창업지원, 왜 구분해서 봐야 하나요?
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            창업지원사업은 중앙부처(중소벤처기업부·고용노동부·과학기술정보통신부
            등)와 지방자치단체가 각각 운영합니다. 지자체 공고는 사업자 주소지나
            사업장 소재지가 해당 지역이어야 신청 가능한 경우가 많아, 내 지역에
            맞는 공고를 먼저 확인하는 것이 시간을 아끼는 방법입니다.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            예를 들어 서울시는 청년창업사관학교, 서울형 강소기업 육성, 서울
            혁신형 창업 패키지 등 자체 프로그램을 운영합니다. 경기도는 경기
            스타트업 캠퍼스, 지역 특화 창업 펀드와 스케일업 지원을 별도로
            운영하며, 부산은 해양·물류·관광·영상콘텐츠 특화 창업지원이
            강점입니다. 인천은 항공·바이오·물류 분야, 대전·세종은
            연구개발(R&D)·딥테크 창업 지원이 집중됩니다.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            gong365.kr은 전국 공고를 지역 키워드 기준으로 자동 분류하여 한
            화면에서 비교할 수 있도록 합니다. 동일한 사업자도 주요 사업장
            소재지에 따라 신청 가능한 공고가 다르므로, 이 페이지에서 지역을 먼저
            선택한 뒤 공고를 탐색하는 것을 추천합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-xl font-semibold text-ink">
          주요 지역별 창업지원 특징
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <RegionFeature
            name="서울"
            desc="청년창업·소셜벤처·문화콘텐츠 분야 지원이 풍부합니다. 서울시 지원 사업은 서울 소재 사업자를 우선하며, 글로벌 진출 연계 프로그램도 다수 포함됩니다."
          />
          <RegionFeature
            name="경기"
            desc="제조·바이오·IT 분야 공고가 많습니다. 판교·수원·성남 등 기술 클러스터 기반 지원사업과 스케일업 단계 창업자를 위한 매칭 펀드가 운영됩니다."
          />
          <RegionFeature
            name="부산"
            desc="해양·물류·관광·영상콘텐츠 특화 창업지원이 강점입니다. 부산시 창업지원센터와 연계된 공간·멘토링 프로그램이 포함된 공고가 많습니다."
          />
          <RegionFeature
            name="인천"
            desc="항공·바이오·물류 분야 특화 지원이 있습니다. 인천 경제자유구역 입주를 연계한 글로벌 창업 패키지도 주기적으로 공고됩니다."
          />
          <RegionFeature
            name="대전·세종"
            desc="연구개발(R&D)·딥테크 창업 지원이 집중됩니다. 대덕연구개발특구 입주 연계 공고와 기술사업화 전용 지원사업이 대표적입니다."
          />
          <RegionFeature
            name="광주·전남"
            desc="자동차·에너지·AI 특화 지원이 있습니다. 광주 AI 산업융합단지 입주 연계 창업 공고와 전남 지역 농식품 창업 지원사업이 운영됩니다."
          />
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="text-xl font-semibold text-ink">
            지역 탐색 이용 방법
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-600">
            <li>위 목록에서 사업장 또는 주소지 기준 관심 지역을 선택하세요.</li>
            <li>
              해당 지역 공고 목록에서 마감일·모집 상태를 확인합니다. 진행 중인
              공고가 상단에 표시됩니다.
            </li>
            <li>공고 제목을 클릭하면 원문 공고 페이지로 이동합니다.</li>
            <li>
              마감된 공고도 이전 모집 조건 참고용으로 보관됩니다. 다음 모집
              시기를 예상하거나 신청 자격 기준을 사전에 확인하는 데 활용하세요.
            </li>
            <li>
              지역 조건 외에도 업종·창업 단계·매출 규모 등 추가 자격 조건은 원문
              공고에서 반드시 확인하세요.
            </li>
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-xl font-semibold text-ink">자주 묻는 질문</h2>
        <div className="mt-6 space-y-4">
          <FaqItem
            q="지역 조건이 없는 공고도 있나요?"
            a="네. 중앙부처 공고는 전국 어디서든 신청 가능한 경우가 많습니다. 지역 탭에 표시되는 공고는 공고문에 지역 키워드가 포함된 항목만 분류한 것으로, 지역 제한 없는 공고는 전체 공고 목록에서 별도 확인하세요."
          />
          <FaqItem
            q="두 지역에 사업장이 있으면 어디서 신청하나요?"
            a="주된 사업장 소재지 기준으로 신청하는 것이 원칙입니다. 공고마다 주소지 기준이 다를 수 있으니 원문 공고의 신청 자격 항목을 반드시 확인하세요."
          />
          <FaqItem
            q="공고 수가 0건인 지역은 지원사업이 없나요?"
            a="해당 지역 키워드가 포함된 공고가 현재 동기화되지 않은 상태입니다. 공고 데이터는 주기적으로 업데이트되며, 지자체 공식 홈페이지나 K-스타트업을 병행해 확인하는 것을 권장합니다."
          />
          <FaqItem
            q="마감된 공고도 볼 수 있나요?"
            a="gong365.kr은 마감된 공고를 삭제하지 않고 보관합니다. 이전 모집 조건·지원 금액·자격 기준을 참고해 다음 공고를 준비하는 데 활용할 수 있습니다."
          />
        </div>
      </section>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="font-semibold text-ink">{q}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{a}</p>
    </div>
  );
}

function RegionFeature({ name, desc }: { name: string; desc: string }) {
  return (
    <article className="rounded-lg border border-line bg-white p-5">
      <h3 className="font-semibold text-ink">{name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </article>
  );
}
