import Link from "next/link";
import { regionRows } from "@/lib/mock-data";

type RegionPageProps = {
  params: Promise<{
    region: string;
  }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return regionRows.map((region) => ({
    region: region.code
  }));
}

export async function generateMetadata({ params }: RegionPageProps) {
  const { region } = await params;
  const regionName = regionRows.find((item) => item.code === region)?.name ?? "지역";

  return {
    title: `${regionName} 창업지원금`,
    description: `${regionName} 지역 창업지원사업 탐색을 준비 중인 페이지입니다.`
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region } = await params;
  const regionName = regionRows.find((item) => item.code === region)?.name ?? "지역";

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/regions" className="text-sm font-semibold text-brand">
          지역 목록
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-ink">{regionName} 창업지원금</h1>
        <p className="mt-3 leading-7 text-slate-600">
          이 페이지는 Bizinfo 데이터 동기화 이후 `{regionName}` 지역 공고 카드와 업종 필터를 표시합니다.
        </p>
      </section>
    </main>
  );
}
