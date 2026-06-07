import Link from "next/link";
import { getSiteName } from "@/lib/site";

interface LegalPageProps {
  title: string;
  description: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
}

export function LegalPage({ title, description, sections }: LegalPageProps) {
  const siteName = getSiteName();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14">
      <nav className="mb-8 text-sm text-slate-500" aria-label="breadcrumb">
        <Link href="/" className="hover:text-brand">
          홈
        </Link>
        <span className="mx-2">/</span>
        <span>{title}</span>
      </nav>
      <header className="border-b border-line pb-8">
        <p className="text-sm font-semibold text-brand">{siteName}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-ink">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </header>
      <div className="mt-10 space-y-9">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-normal text-ink">{section.title}</h2>
            <div className="mt-4 space-y-3 text-base leading-8 text-slate-700">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
