import Link from "next/link";
import { getSiteName } from "@/lib/site";

const FOOTER_LINK_GROUPS = [
  {
    title: "탐색",
    links: [
      { href: "/programs", label: "지원사업 전체" },
      { href: "/events", label: "창업 행사정보" },
      { href: "/regions", label: "지역별 지원사업" },
      { href: "/check", label: "자격 적합성 확인" }
    ]
  },
  {
    title: "데이터",
    links: [
      { href: "/sitemap.xml", label: "사이트맵" },
      { href: "/feed.xml", label: "RSS 피드" },
      { href: "/llms.txt", label: "AI 인덱스" },
      { href: "/llms-full.txt", label: "AI 상세 인덱스" }
    ]
  },
  {
    title: "운영",
    links: [
      { href: "/about", label: "소개" },
      { href: "/contact", label: "문의" },
      { href: "/privacy", label: "개인정보처리방침" },
      { href: "/terms", label: "이용약관" }
    ]
  }
] as const;

export function SiteFooter() {
  const siteName = getSiteName();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <section>
          <Link href="/" className="text-base font-semibold text-ink">
            {siteName}
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            창업지원사업, 정책자금, 지역별 공고와 행사정보를 한곳에서 확인할 수 있도록 정리합니다.
          </p>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            최종 신청 조건과 제출 방식은 각 기관의 원문 공고를 기준으로 확인해야 합니다.
          </p>
        </section>

        {FOOTER_LINK_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-sm font-semibold text-ink">{group.title}</h2>
            <nav className="mt-3 grid gap-2 text-sm text-slate-600" aria-label={`${group.title} 링크`}>
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-brand">
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </footer>
  );
}
