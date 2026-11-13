import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { formatReviewed, groupOf, guideSlugs, listGuides, loadGuide } from "@/lib/guides";

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
const sideLabel = "font-mono text-[11px] uppercase tracking-[0.14em] text-muted";
const sideLink = "block border-l border-line py-1 pl-3 leading-snug text-muted transition-colors hover:border-ink hover:text-ink";

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const [{ guide, Content }, guides] = await Promise.all([loadGuide(slug), listGuides()]);
  const group = groupOf(guide);
  const index = guides.findIndex((item) => item.slug === slug);
  const previous = guides[index - 1];
  const next = guides[index + 1];
  const siblings = guides.filter((item) => item.group === guide.group);

  return (
    <article className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        <Link href="/guides/" className="text-accent hover:underline">
          Guides
        </Link>{" "}
        ·{" "}
        <Link href={`/guides/#${group.id}`} className="hover:text-ink hover:underline">
          {group.code} {group.name}
        </Link>
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance">
        {guide.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{guide.summary}</p>
      <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span className="text-accent">{guide.code}</span>
        <span>{guide.minutes} min read</span>
        {guide.reviewed ? <span>Checked against its sources in {formatReviewed(guide.reviewed)}</span> : null}
      </p>

      <div className="mt-10 grid gap-x-16 border-t border-line pt-8 lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)]">
        {/* On a small screen the contents fold away above the text. */}
        {guide.headings.length > 1 ? (
          <details className="mb-8 rounded-sm border border-line bg-surface lg:hidden">
            <summary className="cursor-pointer px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-muted">
              On this page
            </summary>
            <ol className="border-t border-line px-4 py-3 text-sm">
              {guide.headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`} className="block py-1.5 text-muted hover:text-ink">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        <div className="prose-cs min-w-0">
          <Content />
        </div>

        <aside className="hidden text-sm lg:block">
          <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col gap-8 overflow-y-auto pb-2">
            {guide.headings.length > 1 ? (
              <nav aria-label="On this page">
                <p className={sideLabel}>On this page</p>
                <ol className="mt-3">
                  {guide.headings.map((heading) => (
                    <li key={heading.id}>
                      <a href={`#${heading.id}`} className={sideLink}>
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <nav aria-label={`More in ${group.name}`}>
              <p className={sideLabel}>
                {group.code} {group.name}
              </p>
              <ol className="mt-3">
                {siblings.map((item) => (
                  <li key={item.slug}>
                    {item.slug === slug ? (
                      <span aria-current="page" className="block border-l border-accent py-1 pl-3 leading-snug text-ink">
                        {item.title}
                      </span>
                    ) : (
                      <Link href={`/guides/${item.slug}/`} className={sideLink}>
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </aside>
      </div>

      <div className="mt-14 max-w-[42rem] border-t border-line pt-6 text-sm leading-relaxed text-muted">
        <p>
          Found a mistake, or something that has gone out of date?{" "}
          <a
            href={`${site.repo}/issues`}
            rel="noopener"
            className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
          >
            Open an issue
          </a>{" "}
          or write to{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
          >
            {site.email}
          </a>
          . This guide is a text file you can read and correct:{" "}
          <a
            href={`${site.repo}/blob/main/src/guides/${slug}.mdx`}
            rel="noopener"
            className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
          >
            Source of this page
          </a>
          .
        </p>
      </div>

      <nav aria-label="More guides" className="mt-8 grid max-w-[42rem] gap-3 sm:grid-cols-2">
        {previous ? (
          <Link href={`/guides/${previous.slug}/`} className={pagerLink}>
            <span className="font-mono text-xs text-muted">← {previous.code}</span>
            <span className="font-medium group-hover:text-accent">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/guides/${next.slug}/`} className={`${pagerLink} sm:items-end sm:text-right`}>
            <span className="font-mono text-xs text-muted">{next.code} →</span>
            <span className="font-medium group-hover:text-accent">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
