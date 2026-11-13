import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { DocStatusChip } from "@/components/StatusChip";
import { site } from "@/data/site";
import { formatMonth, type Doc, type DocGroup } from "@/lib/docs";
import { docStatus } from "@/lib/status";

const pagerLink = "group flex flex-col gap-1 rounded-sm border border-line p-4 transition-colors hover:border-ink";
const sideLabel = "font-mono text-[11px] uppercase tracking-[0.14em] text-muted";
const sideLink =
  "block border-l border-line py-1 pl-3 leading-snug text-muted transition-colors hover:border-ink hover:text-ink";
const inlineLink = "text-ink underline decoration-accent underline-offset-4 hover:text-accent";

/** One guide or platform page: title block, text, table of contents, siblings and pager. */
export function DocArticle({
  section,
  doc,
  group,
  docs,
  Content,
  children,
}: {
  /** The library this page belongs to. */
  section: { name: string; href: string; folder: string };
  doc: Doc;
  group: DocGroup;
  /** Every page in the same library, in reading order. */
  docs: Doc[];
  Content: ComponentType;
  /** Anything to show under the text, such as related tools. */
  children?: ReactNode;
}) {
  const index = docs.findIndex((item) => item.slug === doc.slug);
  const previous = docs[index - 1];
  const next = docs[index + 1];
  const siblings = docs.filter((item) => item.group === doc.group);

  return (
    <article className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        <Link href={section.href} className="text-accent hover:underline">
          {section.name}
        </Link>{" "}
        ·{" "}
        <Link href={`${section.href}#${group.id}`} className="hover:text-ink hover:underline">
          {group.code} {group.name}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance">{doc.title}</h1>
        {doc.status ? <DocStatusChip status={doc.status} /> : null}
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{doc.summary}</p>
      <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted">
        <span className="text-accent">{doc.code}</span>
        <span>{doc.minutes} min read</span>
        {doc.revised ? <span>Last revised {formatMonth(doc.revised)}</span> : null}
      </p>

      {doc.status ? (
        <p className="mt-6 max-w-[42rem] rounded-sm border border-dashed border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
          <strong className="font-medium text-ink">Status: {docStatus[doc.status].label}.</strong>{" "}
          {docStatus[doc.status].meaning}{" "}
          <Link href="/platform/#status" className={inlineLink}>
            What the labels mean
          </Link>
          .
        </p>
      ) : null}

      <div className="mt-10 grid gap-x-16 border-t border-line pt-8 lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)]">
        {/* On a small screen the contents fold away above the text. */}
        {doc.headings.length > 1 ? (
          <details className="mb-8 rounded-sm border border-line bg-surface lg:hidden">
            <summary className="cursor-pointer px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-muted">
              On this page
            </summary>
            <ol className="border-t border-line px-4 py-3 text-sm">
              {doc.headings.map((heading) => (
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
            {doc.headings.length > 1 ? (
              <nav aria-label="On this page">
                <p className={sideLabel}>On this page</p>
                <ol className="mt-3">
                  {doc.headings.map((heading) => (
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
                    {item.slug === doc.slug ? (
                      <span aria-current="page" className="block border-l border-accent py-1 pl-3 leading-snug text-ink">
                        {item.title}
                      </span>
                    ) : (
                      <Link href={item.href} className={sideLink}>
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

      {children}

      <div className="mt-14 max-w-[42rem] border-t border-line pt-6 text-sm leading-relaxed text-muted">
        <p>
          Found a mistake, or something that has gone out of date?{" "}
          <a href={`${site.repo}/issues`} rel="noopener" className={inlineLink}>
            Open an issue
          </a>{" "}
          or write to{" "}
          <a href={`mailto:${site.email}`} className={inlineLink}>
            {site.email}
          </a>
          . This page is a text file you can read and correct:{" "}
          <a href={`${site.repo}/blob/main/src/${section.folder}/${doc.slug}.mdx`} rel="noopener" className={inlineLink}>
            Source of this page
          </a>
          .
        </p>
      </div>

      <nav aria-label={`More in ${section.name}`} className="mt-8 grid max-w-[42rem] gap-3 sm:grid-cols-2">
        {previous ? (
          <Link href={previous.href} className={pagerLink}>
            <span className="font-mono text-xs text-muted">← {previous.code}</span>
            <span className="font-medium group-hover:text-accent">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className={`${pagerLink} sm:items-end sm:text-right`}>
            <span className="font-mono text-xs text-muted">{next.code} →</span>
            <span className="font-medium group-hover:text-accent">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
