import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { getSiteName, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "창업 블로그 – 지원사업 정보·전략 가이드",
  description:
    "창업지원사업 신청 가이드, 정책자금 활용법, 사업계획서 작성 전략을 정리합니다.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "창업 블로그 – 지원사업 정보·전략 가이드",
    description:
      "창업지원사업 신청 가이드, 정책자금 활용법, 사업계획서 작성 전략을 정리합니다.",
    url: `${getSiteUrl()}/blog`,
    siteName: getSiteName(),
    locale: "ko_KR",
    type: "website",
  },
};

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-ink">창업 블로그</h1>
        <p className="mt-2 text-sm text-slate-500">
          창업지원사업 신청 전략, 정책자금 활용법, 사업계획서 작성 가이드를
          정리합니다.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {sorted.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col rounded-lg border border-line bg-white p-5 shadow-panel"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-brand">
                <Tag size={11} aria-hidden />
                {post.category}
              </span>
              <time
                dateTime={post.publishedAt}
                className="text-xs text-slate-400"
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>

            <h2 className="flex-1 text-base font-bold leading-6 text-ink">
              <Link href={`/blog/${post.slug}`} className="hover:text-brand">
                {post.title}
              </Link>
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">
              {post.description}
            </p>

            <div className="mt-4 border-t border-line pt-4">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
              >
                자세히 보기
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
