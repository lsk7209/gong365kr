import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Tag, CalendarDays } from "lucide-react";
import { getPublishedBlogPost, getPublishedBlogSlugs } from "@/lib/blog/posts";
import { getSiteName, getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPublishedBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedBlogPost(slug);
  if (!post) return {};

  const url = `${getSiteUrl()}/blog/${slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: getSiteName(),
      locale: "ko_KR",
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPublishedBlogPost(slug);
  if (!post) notFound();

  const siteUrl = getSiteUrl();
  const siteName = getSiteName();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    url: `${siteUrl}/blog/${slug}`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* 브레드크럼 */}
        <nav
          aria-label="경로"
          className="mb-6 flex items-center gap-1 text-xs text-slate-400"
        >
          <Link href="/" className="hover:text-brand">
            홈
          </Link>
          <ChevronRight size={12} aria-hidden />
          <Link href="/blog" className="hover:text-brand">
            블로그
          </Link>
          <ChevronRight size={12} aria-hidden />
          <span className="text-slate-600">{post.category}</span>
        </nav>

        {/* 헤더 */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-brand">
              <Tag size={11} aria-hidden />
              {post.category}
            </span>
            <time
              dateTime={post.publishedAt}
              className="inline-flex items-center gap-1 text-xs text-slate-400"
            >
              <CalendarDays size={12} aria-hidden />
              {formatDate(post.publishedAt)}
            </time>
          </div>
          <h1 className="text-2xl font-bold leading-snug text-ink">
            {post.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            {post.description}
          </p>
        </header>

        {/* 본문 */}
        <article
          className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-ink prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-li:text-slate-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.researchSources && post.researchSources.length > 0 ? (
          <section
            aria-labelledby="research-sources"
            className="mt-10 rounded-lg border border-line bg-slate-50 p-5"
          >
            <h2
              id="research-sources"
              className="text-base font-bold text-ink"
            >
              확인한 공식 출처
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {post.researchSources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    {source.title}
                  </a>
                  <span className="text-slate-500">
                    {" "}
                    · {source.publisher} · 확인일 {source.checkedAt}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 태그 */}
        <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 목록으로 */}
        <div className="mt-8">
          <Link
            href="/blog"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← 블로그 목록으로
          </Link>
        </div>
      </main>
    </>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
