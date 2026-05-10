import { CalendarClock, MapPinned, Search } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/programs", label: "지원사업" },
  { href: "/events", label: "행사정보" },
  { href: "/regions", label: "지역별" },
  { href: "/check", label: "적합도 체크" }
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3" aria-label="주요 메뉴">
        <Link href="/" className="flex min-w-fit items-center gap-2 text-base font-extrabold text-ink">
          <span className="flex size-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">공</span>
          창업머니맵
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm text-slate-600">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="min-w-fit rounded-md px-3 py-2 font-semibold hover:bg-slate-100 hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href={createCurrentDeadlineHref()}
          className="hidden min-w-fit items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-bold text-white sm:inline-flex"
        >
          <CalendarClock size={16} aria-hidden />
          마감 공고
        </Link>
      </nav>

      <div className="border-t border-line/60 bg-slate-50 sm:hidden">
        <div className="mx-auto flex max-w-6xl gap-2 px-4 py-2">
          <Link href="/programs" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink">
            <Search size={15} aria-hidden />
            공고 찾기
          </Link>
          <Link href="/regions" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink">
            <MapPinned size={15} aria-hidden />
            지역별
          </Link>
        </div>
      </div>
    </header>
  );
}

function createCurrentDeadlineHref() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `/deadline/${year}/${month}`;
}
