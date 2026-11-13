import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel";
import { StatusChip } from "@/components/StatusChip";
import { categories, liveCount, tools, toolsIn } from "@/data/catalog";
import { site } from "@/data/site";

const requirements = [
  {
    id: "H.1",
    title: "Free",
    body: "No paywall, no ads, no subscription, no “contact sales”. The project takes in no revenue.",
  },
  {
    id: "H.2",
    title: "Open source",
    body: "MIT licensed. Read the code, check the math, fork it, host it yourself.",
  },
  {
    id: "H.3",
    title: "Client-side",
    body: "Tools run in your browser. Your rates, proposal text and system details stay on your machine. There is no backend to send them to.",
  },
  {
    id: "H.4",
    title: "Independent",
    body: "A personal project built from public sources. No affiliation with the Department of Defense or any agency.",
  },
];

const deliveries = [
  {
    phase: "Phase 1",
    title: "The free arsenal",
    body: "Ship the catalog one tool at a time until this is the page a small contractor keeps open all day.",
  },
  {
    phase: "Phase 2",
    title: "The community",
    body: "Open the catalog to tools written by other engineers, veterans and people who do this work for a living.",
  },
  {
    phase: "Phase 3",
    title: "The institution",
    body: "Grow that community into something lasting that can compete for the work itself.",
  },
];

const button =
  "inline-flex items-center justify-center rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Free · Open source · Runs in your browser · Revised {site.revised}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
            Free tools for the paperwork between you and a government contract.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            ClearedStack is an open-source set of small, single-purpose tools for pricing, proposals and cyber
            compliance. Built for solo developers, veteran founders and small shops that would rather build than fill
            out forms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tools/" className={`${button} border-ink bg-ink text-paper hover:border-accent hover:bg-accent hover:text-accent-ink`}>
              Browse the tools
            </Link>
            <Link href="/guides/" className={`${button} border-line text-ink hover:border-ink`}>
              How to use it
            </Link>
            <Link href="/about/" className={`${button} border-line text-ink hover:border-ink`}>
              Read the mission
            </Link>
          </div>
        </div>

        {/* The whole pitch, written as the price schedule of a contract. */}
        <div className="rounded-sm border border-line bg-surface">
          <div className="border-b border-line px-4 py-3 sm:px-5">
            <SectionLabel section="Section B">Supplies or services and prices</SectionLabel>
          </div>
          <table className="w-full border-collapse font-mono text-[13px] sm:text-sm">
            <caption className="sr-only">
              The five tool categories, listed as contract line items, each priced at zero dollars.
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                <th scope="col" className="py-2.5 pl-4 pr-2 font-normal sm:pl-5">
                  CLIN
                </th>
                <th scope="col" className="px-2 py-2.5 font-normal">
                  Description
                </th>
                <th scope="col" className="hidden px-2 py-2.5 font-normal sm:table-cell">
                  Unit
                </th>
                <th scope="col" className="py-2.5 pl-2 pr-4 text-right font-normal sm:pr-5">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-line">
                  <td className="py-3 pl-4 pr-2 align-top text-muted sm:pl-5">{category.clin}</td>
                  <td className="px-2 py-3 align-top">
                    <Link
                      href={`/tools/#${category.id}`}
                      className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="hidden px-2 py-3 align-top text-muted sm:table-cell">EA</td>
                  <td className="py-3 pl-2 pr-4 text-right align-top tabular-nums sm:pr-5">$0.00</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={2} className="py-3.5 pl-4 pr-2 text-left font-medium sm:pl-5">
                  Total evaluated price
                </th>
                <td className="hidden sm:table-cell" />
                <td className="py-3.5 pl-2 pr-4 text-right font-medium tabular-nums text-accent sm:pr-5">$0.00</td>
              </tr>
            </tfoot>
          </table>
          <p className="border-t border-line px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted sm:px-5">
            Firm-fixed-price · Period of performance: indefinite · Revised {site.revised}
          </p>
        </div>
      </section>

      {/* Catalog preview */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <SectionLabel section="Section C">Statement of work</SectionLabel>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <h2 className="text-3xl font-semibold tracking-[-0.015em] text-balance">
              {tools.length} tools across five areas, each one doing a single job.
            </h2>
            <p className="leading-relaxed text-muted">
              Every tool is its own repository, so it can be audited, forked and self-hosted on its own. This site is
              the index.{" "}
              {liveCount === 0
                ? "None are live yet. The first ones are being built now."
                : `${liveCount} ${liveCount === 1 ? "is" : "are"} live today.`}
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col bg-surface p-5 sm:p-6">
                <p className="font-mono text-xs text-muted">CLIN {category.clin}</p>
                <h3 className="mt-2 text-lg font-semibold">
                  <Link href={`/tools/#${category.id}`} className="transition-colors hover:text-accent">
                    {category.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{category.blurb}</p>
                <ul className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
                  {toolsIn(category.id).map((tool) => (
                    <li key={tool.slug} className="flex items-start justify-between gap-3">
                      <span>{tool.name}</span>
                      <StatusChip status={tool.status} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-col justify-between gap-6 bg-paper p-5 sm:p-6">
              <p className="leading-relaxed text-muted">
                Missing the one you need? The catalog grows by request and by contribution.
              </p>
              <Link
                href="/tools/"
                className="font-mono text-sm text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
              >
                See the full catalog →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <SectionLabel section="Section H">Special contract requirements</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.015em] text-balance">
            Four terms that do not change.
          </h2>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {requirements.map((item) => (
              <div key={item.id} className="border-t-2 border-ink pt-4">
                <dt>
                  <span className="font-mono text-xs text-accent">{item.id}</span>
                  <span className="mt-1 block text-lg font-semibold">{item.title}</span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <SectionLabel section="Section F">Deliveries or performance</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.015em] text-balance">
            Where this is going.
          </h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
            {deliveries.map((item, index) => (
              <li key={item.phase} className="bg-surface p-5 sm:p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                  {item.phase}
                  {index === 0 ? <span className="text-accent"> · Now</span> : null}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contribute */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-16 lg:pt-20">
          <div>
            <SectionLabel>Contribute</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
              Rebuilding the same spreadsheet for every proposal? That is a tool.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              If you have turned a regulation into a checklist, a formula or a script, it can help the next person
              skip the week you spent on it. Suggest a tool, or build one and add it to the catalog.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a href={site.github} rel="noopener" className={`${button} border-ink bg-ink text-paper hover:border-accent hover:bg-accent hover:text-accent-ink`}>
              ClearedStack on GitHub
            </a>
            <a href={`mailto:${site.email}`} className={`${button} border-line text-ink hover:border-ink`}>
              {site.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
