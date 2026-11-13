import type { Metadata } from "next";
import Link from "next/link";
import { guideSlugs, listGuides, loadGuide } from "@/lib/guides";

export const dynamicParams = false;

export function generateStaticParams() {
  return guideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { guide } = await loadGuide(slug);
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guides/${slug}/` },
  };
}

const pagerLink = "group flex flex-col gap-1 rounded-sm border border-line p-4 transition-colors hover:border-ink";

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const [{ guide, Content }, guides] = await Promise.all([loadGuide(slug), listGuides()]);
  const index = guides.findIndex((item) => item.slug === slug);
  const previous = guides[index - 1];
  const next = guides[index + 1];

  return (
    <article className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        <Link href="/guides/" className="text-accent hover:underline">
          Guides
        </Link>{" "}
        · {String(index + 1).padStart(2, "0")} of {String(guides.length).padStart(2, "0")}
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance">
        {guide.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{guide.summary}</p>

      <div className="prose-cs mt-10 max-w-[42rem] border-t border-line pt-8">
        <Content />
      </div>

      <nav aria-label="More guides" className="mt-14 grid max-w-[42rem] gap-3 sm:grid-cols-2">
        {previous ? (
          <Link href={`/guides/${previous.slug}/`} className={pagerLink}>
            <span className="font-mono text-xs text-muted">← Previous</span>
            <span className="font-medium group-hover:text-accent">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/guides/${next.slug}/`} className={`${pagerLink} sm:items-end sm:text-right`}>
            <span className="font-mono text-xs text-muted">Next →</span>
            <span className="font-medium group-hover:text-accent">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
