import { Metadata } from "next";
import { redirect } from "next/navigation";
import type { SearchParams } from "./[...path]/page";

export const metadata: Metadata = {
  title: "PLAN 리디렉션",
  description: "공고/지원금 페이지 이동용 PLAN 경로에서 지원사업 페이지로 안내합니다.",
};

type PlanPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item.trim()) {
          params.append(key, item);
        }
      }
      continue;
    }
    if (String(value).trim()) {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();

  redirect(queryString ? `/programs?${queryString}` : "/programs");
}
