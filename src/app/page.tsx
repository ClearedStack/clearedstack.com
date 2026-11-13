import Link from "next/link";
import { Flow } from "@/components/Diagram";
import { SectionLabel } from "@/components/SectionLabel";
import { StatusChip } from "@/components/StatusChip";
import { categories, liveCount, tools, toolsIn } from "@/data/catalog";
import { controlPlaneApps, workerApps } from "@/data/platform";
import { site } from "@/data/site";

const requirements = [
  {
    id: "H.1",
    title: "Free",
    body: "No paywall, no ads, no subscription, no “contact sales”. Every tool and platform app is $0.00 forever.",
  },
  {
    id: "H.2",
    title: "Open source",
    body: "MIT licensed across all tools, the 11 pipeline repositories, and the 4 clean-room Go control-plane services.",
  },
  {
    id: "H.3",
    title: "Client-side & deterministic",
    body: "Contracting tools run in your browser with zero network calls, and all 10 factory workers run 100% deterministic code with zero AI at runtime.",
  },
  {
    id: "H.4",
    title: "Independent & builder-first",
    body: "Built from official public sources so engineers and small shops can bid and own the value of their labor directly—no DoD affiliation.",
  },
];

const deliveries = [
  {
    phase: "Phase 1",
    title: "The free arsenal",
    body: "Ship the catalog one single-purpose tool at a time through our deterministic clean-room factory until small contractors keep this tab open all day.",
  },
  {
    phase: "Phase 2",
    title: "The community",
    body: "Open the catalog and public edit loop to tools, sub-tools, and worked examples contributed by engineers, practitioners, and veterans.",
  },
  {
    phase: "Phase 3",
    title: "The institution",
    body: "Grow that community into a lasting public alternative where the builders doing the work can compete for contracts on their own terms.",
  },
];

const button =
  "inline-flex items-center justify-center rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors";

export default function Home() {
  const totalPlatformApps = controlPlaneApps.length + workerApps.length;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Free · MIT open source · Zero AI at runtime · Revised {site.revised}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
            Free tools for the paperwork between you and a government contract.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            ClearedStack is an open-source set of single-purpose browser tools—backed by a public, 100% deterministic
            software factory—for pricing, proposals, and cyber compliance. Built for solo engineers, veteran founders,
            and small teams that would rather build than pay corporate overhead to fill out forms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tools/"
              className={`${button} border-ink bg-ink text-paper hover:border-accent hover:bg-accent hover:text-accent-ink`}
            >
              Browse tools &amp; apps
            </Link>
            <Link href="/guides/" className={`${button} border-line text-ink hover:border-ink`}>
              Guides &amp; live factory
            </Link>
            <Link href="/about/" className={`${button} border-line text-ink hover:border-ink`}>
              Read the mission
            </Link>
          </div>
        </div>

        {/* Price schedule of a federal contract (Section B) */}
        <div className="rounded-sm border border-line bg-surface">
          <div className="border-b border-line px-4 py-3 sm:px-5">
            <SectionLabel section="Section B">Supplies or services and prices</SectionLabel>
          </div>
          <table className="w-full border-collapse font-mono text-[13px] sm:text-sm">
            <caption className="sr-only">
              The five contracting tool categories and platform app suite, listed as contract line items at zero
              dollars.
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
              <tr className="border-b border-line">
                <td className="py-3 pl-4 pr-2 align-top text-muted sm:pl-5">0006</td>
                <td className="px-2 py-3 align-top">
                  <Link
                    href="/tools/#apps"
                    className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                  >
                    Platform &amp; Factory Apps ({totalPlatformApps} MIT services)
                  </Link>
                </td>
                <td className="hidden px-2 py-3 align-top text-muted sm:table-cell">LOT</td>
                <td className="py-3 pl-2 pr-4 text-right align-top tabular-nums sm:pr-5">$0.00</td>
              </tr>
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
            Firm-fixed-price · No login lock · Revised {site.revised}
          </p>
        </div>
      </section>

      {/* Catalog preview (Section C) */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <SectionLabel section="Section C">Statement of work</SectionLabel>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <h2 className="text-3xl font-semibold tracking-[-0.015em] text-balance">
              {tools.length} browser tools and {totalPlatformApps} platform apps, each doing one bounded job.
            </h2>
            <p className="leading-relaxed text-muted">
              Every contracting utility and every factory microservice ships in its own repository so it can be read,
              audited, forked, and self-hosted on its own.{" "}
              {liveCount === 0
                ? "All 18 contracting utilities are currently planned while the v3.1 deterministic factory comes online."
                : `${liveCount} of ${tools.length} contracting utilities ${liveCount === 1 ? "is" : "are"} live today.`}
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
              <div>
                <p className="font-mono text-xs text-accent">CLIN 0006 · Platform &amp; Factory</p>
                <h3 className="mt-2 text-lg font-semibold">
                  <Link href="/tools/#apps" className="transition-colors hover:text-accent">
                    7 Control-Plane Apps &amp; 10 Workers
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Dockerless <code className="text-ink">k3s</code> services (<code className="text-ink">cs-git</code>,{" "}
                  <code className="text-ink">cs-registry</code>, <code className="text-ink">cs-runner</code>,{" "}
                  <code className="text-ink">cs-store</code>) plus <code className="text-ink">cs-01</code> through{" "}
                  <code className="text-ink">cs-10</code>—all listed under Tools and live under Guides.
                </p>
              </div>
              <div className="flex flex-col gap-2 border-t border-line pt-4 font-mono text-xs">
                <Link
                  href="/tools/"
                  className="text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
                >
                  Open full Tools &amp; Apps catalog →
                </Link>
                <Link
                  href="/guides/command/"
                  className="text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                >
                  Inspect live Command Portal (/guides/command) →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles (Section H) */}
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

      {/* Roadmap (Section F) */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <SectionLabel section="Section F">Deliveries or performance</SectionLabel>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.015em] text-balance">
            Where this is going.
          </h2>
          <div className="mt-8">
            <Flow
              caption="ClearedStack delivery roadmap across three phases."
              direction="across"
              highlight={0}
              steps={[
                {
                  tag: "Phase 1 · Now",
                  label: "The free arsenal",
                  detail: "Ship single-purpose tools one by one until small contractors keep this tab open all day.",
                },
                {
                  tag: "Phase 2",
                  label: "The community",
                  detail: "Open the catalog to tools built by other engineers, practitioners, and veterans.",
                },
                {
                  tag: "Phase 3",
                  label: "The institution",
                  detail: "Grow the community into a lasting public alternative that can compete for the work directly.",
                },
              ]}
            />
          </div>
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

      {/* How a tool gets here (Section M & Live Factory under Guides) */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionLabel section="Section M">Evaluation factors &amp; live factory</SectionLabel>
            <Link
              href="/guides/how-we-decide/"
              className="font-mono text-xs text-accent underline decoration-accent underline-offset-4 hover:text-ink"
            >
              Read Section M evaluation factors →
            </Link>
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <h2 className="text-3xl font-semibold tracking-[-0.015em] text-balance">
              How a tool gets here—and how the factory builds in public.
            </h2>
            <p className="leading-relaxed text-muted">
              Ten deterministic Go worker repositories (<code className="text-ink">cs-01-intake</code> through{" "}
              <code className="text-ink">cs-10-notify</code>) observe public pages, score candidates against five
              knockout gates and a 100-point rubric, pause for human decisions, and build clean-room browser tools from
              official regulations. Every live view sits openly under{" "}
              <Link href="/guides/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
                Guides
              </Link>
              .
            </p>
          </div>

          <div className="mt-8">
            <Flow
              caption="The 10-worker deterministic path from candidate intake to verified catalog listing."
              direction="across"
              steps={[
                { tag: "cs-01..02", label: "Intake & Observe", detail: "Deduplicate PA-XXXX & seal public snapshots." },
                { tag: "cs-03", label: "Screen & Score", detail: "5 binary gates + 100-pt deterministic rubric." },
                { tag: "cs-04", label: "Human Decide", detail: "Approve, Link, Merge, Park, or Reject." },
                { tag: "cs-05..06", label: "Credit & Build", detail: "Clean-room spec & isolated static repo." },
                { tag: "cs-07..08", label: "Verify & List", detail: "5-condition QA & publish to /tools." },
                { tag: "cs-09..10", label: "Monitor & Route", detail: "Watch eCFR/NIST drift & route ✎ edits." },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-muted">
            <p>
              Authored with Claude Code and Antigravity, reviewed by a person; 0 AI calls at runtime. Read{" "}
              <Link
                href="/guides/built-with-ai/"
                className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
              >
                how AI is used at authoring time
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/guides/command/" className="text-ink underline decoration-line underline-offset-4 hover:text-accent">
                Command
              </Link>
              <Link href="/guides/apps/" className="text-ink underline decoration-line underline-offset-4 hover:text-accent">
                Apps
              </Link>
              <Link href="/guides/pipeline/" className="text-ink underline decoration-line underline-offset-4 hover:text-accent">
                Pipeline
              </Link>
              <Link href="/guides/decide/" className="text-ink underline decoration-line underline-offset-4 hover:text-accent">
                Decide
              </Link>
            </div>
          </div>
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
              If you have turned a regulation into a checklist, a formula, or a script, it can help the next person
              skip the week you spent on it. Suggest a tool, click <code className="text-ink">✎ Edit</code> on any
              live factory view under Guides, or open a pull request on GitHub.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={site.github}
              rel="noopener"
              className={`${button} border-ink bg-ink text-paper hover:border-accent hover:bg-accent hover:text-accent-ink`}
            >
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
