import type { Metadata } from "next";
import Link from "next/link";
import { GuideIndex } from "@/components/GuideIndex";
import { SectionLabel } from "@/components/SectionLabel";
import { site } from "@/data/site";
import { guideGroups, listGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Field guides, platform specifications, and Section M evaluation rules for ClearedStack—all in one open, searchable index.",
  alternates: { canonical: "/guides/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";

export default async function GuidesPage() {
  const guides = await listGuides();
  const minutes = guides.reduce((total, guide) => total + guide.minutes, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Section L">Field guides &amp; specifications</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>

      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
        Guides
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {guides.length} plain-language field guides, platform specifications, and evaluation rules ({Math.floor(minutes / 60)}{" "}
        h {minutes % 60} min total reading time). Every section below uses the same open format—filter by section or
        keyword.
      </p>

      <div className="mt-10">
        <GuideIndex
          groups={guideGroups}
          guides={guides.map((guide) => ({
            slug: guide.slug,
            code: guide.code,
            title: guide.title,
            summary: guide.summary,
            group: guide.group,
            minutes: guide.minutes,
            draft: guide.draft,
            topics: guide.headings.map((heading) => heading.text).filter((text) => text !== "Sources"),
          }))}
        />
      </div>

      <section className="mt-16 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <SectionLabel>Before you rely on a guide</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            The field guides explain public rules in plain language. They are not legal, accounting, or compliance
            advice, and rules change. Each regulatory guide names its official sources and the month it was last
            checked. When a guide and the current text of a regulation disagree, the regulation wins, and{" "}
            <Link href="/guides/public-sources/" className={inlineLink}>
              Public sources
            </Link>{" "}
            shows where to read it.
          </p>
        </div>
        <div>
          <SectionLabel>Missing or wrong</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            If a guide is unclear, out of date, or does not exist yet, open an issue on{" "}
            <a href={`${site.repo}/issues`} rel="noopener" className={inlineLink}>
              GitHub
            </a>
            , or write to{" "}
            <a href={`mailto:${site.email}`} className={inlineLink}>
              {site.email}
            </a>
            . Every guide is a plain MDX file in <code className="text-ink">src/guides/</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
