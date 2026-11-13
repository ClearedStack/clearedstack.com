import type { Metadata } from "next";
import Link from "next/link";
import { DocIndex } from "@/components/DocIndex";
import { SectionLabel } from "@/components/SectionLabel";
import { site } from "@/data/site";
import { guides } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain-language guides to government contracting paperwork: reading and answering a solicitation, labor rates, invoices, protecting government information, codes and small business status.",
  alternates: { canonical: "/guides/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";

/** Short reading orders for common situations. Each entry is a file name in src/guides. */
const routes = [
  {
    name: "Bidding for the first time",
    blurb: "From opening the solicitation to a priced answer.",
    slugs: ["read-a-solicitation", "answer-a-solicitation", "labor-rates"],
  },
  {
    name: "Getting registered and paid",
    blurb: "The codes that decide what you can bid on, and the rules for invoices.",
    slugs: ["codes-and-small-business", "getting-paid"],
  },
  {
    name: "Handling government information",
    blurb: "What you have to protect, and the files compliance work runs on.",
    slugs: ["protecting-government-information", "compliance-as-data", "your-data"],
  },
  {
    name: "Working where nothing connects",
    blurb: "Moving software across a boundary, and running this site inside one.",
    slugs: ["disconnected-networks", "host-static-files", "closed-networks"],
  },
];

export default async function GuidesPage() {
  const docs = await guides.list();
  const minutes = docs.reduce((total, doc) => total + doc.minutes, 0);
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  const find = (slug: string) => {
    const doc = bySlug.get(slug);
    if (!doc) throw new Error(`The reading routes on /guides/ name "${slug}", which is not in src/guides.`);
    return doc;
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Section L">Instructions to offerors</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>

      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
        Guides
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {docs.length} plain-language guides to the paperwork the tools support, about {Math.round(minutes / 60)} hours of
        reading in all. Each one names its official sources. How the project itself is built and run is under{" "}
        <Link href="/platform/" className={inlineLink}>
          Platform
        </Link>
        .
      </p>

      <section aria-labelledby="routes-title" className="mt-10">
        <h2 id="routes-title" className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Pick a route
        </h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((route) => (
            <div key={route.name} className="bg-surface p-5">
              <h3 className="font-semibold leading-snug">{route.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{route.blurb}</p>
              <ol className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
                {route.slugs.map(find).map((doc, index) => (
                  <li key={doc.slug} className="flex gap-2.5">
                    <span className="pt-px font-mono text-xs text-accent">{index + 1}</span>
                    <Link
                      href={doc.href}
                      className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <DocIndex
          groups={guides.groups}
          placeholder="Filter: wrap rate, CUI, invoice, NAICS, nginx…"
          docs={docs.map((doc) => ({
            slug: doc.slug,
            href: doc.href,
            code: doc.code,
            title: doc.title,
            summary: doc.summary,
            group: doc.group,
            minutes: doc.minutes,
            status: doc.status,
            topics: doc.headings.map((heading) => heading.text).filter((text) => text !== "Sources"),
          }))}
        />
      </div>

      <section className="mt-16 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <SectionLabel>Before you rely on a guide</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            The guides explain public rules in plain language. They are not legal, accounting or compliance advice, and
            rules change. Each guide about a regulation names its official sources and the month it was last checked.
            When a guide and the current text of a regulation disagree, the regulation wins, and{" "}
            <Link href="/guides/public-sources/" className={inlineLink}>
              Where the rules live
            </Link>{" "}
            shows where to read it.
          </p>
        </div>
        <div>
          <SectionLabel>Missing or wrong</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            If a guide is unclear, out of date or does not exist yet, open an issue on{" "}
            <a href={`${site.repo}/issues`} rel="noopener" className={inlineLink}>
              GitHub
            </a>
            , or write to{" "}
            <a href={`mailto:${site.email}`} className={inlineLink}>
              {site.email}
            </a>
            . Every guide is a plain text file in <code className="text-ink">src/guides/</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
