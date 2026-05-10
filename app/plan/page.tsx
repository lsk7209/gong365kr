import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "PLAN 리디렉션",
  description: "공고/지원금 페이지 이동용 PLAN 경로에서 지원사업 페이지로 안내합니다.",
};

export default function PlanPage() {
  redirect("/programs");
}
