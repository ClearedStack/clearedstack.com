import type { Metadata } from "next";
import Link from "next/link";
import { Flow } from "@/components/Diagram";
import { GuideIndex } from "@/components/GuideIndex";
import { GuidesSubnav } from "@/components/GuidesSubnav";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip, HealthChip } from "@/components/StatusChip";
import { site } from "@/data/site";
import { guideGroups, listGuides, type Guide } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides & Live Factory",
  description:
    "Section L · Guides and live factory views for ClearedStack: Command Portal, Cluster App Store, 10-Worker Pipeline, Decide Queue, Section M evaluation rubric, contracting field guides, and self-hosting manuals.",
  alternates: { canonical: "/guides/" },
};

const factoryViews = [
  {
    code: "L.0.1",
    title: "Command Portal",
    href: "/guides/command/",
    badge: "Portal",
    state: "idle" as const,
    body: "Deterministic P0–P2 attention feed, sanitized error codes, 10-worker pulse strip, and 7 control-plane pods with no login lock.",
  },
  {
    code: "L.0.2",
    title: "Cluster App Store",
    href: "/guides/apps/",
    badge: "cs-store",
    state: "healthy" as const,
    body: "Live Server-Side Apply view of all 17 pods across clearedstack and cs-workers, with Owner Mode 5-digest rollback preview.",
  },
  {
    code: "L.0.3",
    title: "10-Worker Pipeline",
    href: "/guides/pipeline/",
    badge: "cs-01..10",
    state: "idle" as const,
    body: "Real-time queue lanes, PA-XXXX item trails, local /var/spool/cs volumes, and per-case deterministic tools/<case>/ sub-tools.",
  },
  {
    code: "L.0.4",
    title: "Decide & Public Edits",
    href: "/guides/decide/",
    badge: "cs-04-decide",
    state: "idle" as const,
    body: "Publicly readable queue for candidate determinations (Build, Link, Merge, Park, Reject) and anonymous ✎ Edit proposals.",
  },
  {
    code: "L.0.5",
    title: "How We Decide (Section M)",
    href: "/guides/how-we-decide/",
    badge: "Rubric",
    state: "healthy" as const,
    body: "Full evaluation specification: 5 binary knockout gates, 100-point weighted rubric, 14-state record lifecycle, and clean-room rules.",
  },
];

/** Reading routes through the guides, organized by reader goal. */
const routes = [
  {
    tag: "Route 01 · Orientation",
    title: "New to the site",
    body: "How to navigate ClearedStack, where your data stays, and how to verify any result before using it.",
    slugs: ["navigating-this-site", "getting-started", "your-data", "checking-results", "faq"],
  },
  {
    tag: "Route 02 · Contracting",
    title: "Bidding a first contract",
    body: "The structure of a federal solicitation and the core pricing, CUI, and registration rules.",
    slugs: [
      "read-a-solicitation",
      "answer-a-solicitation",
      "labor-rates",
      "protecting-government-information",
      "codes-and-small-business",
    ],
  },
  {
    tag: "Route 03 · Factory",
    title: "How the factory builds itself",
    body: "How 11 pipeline repos, 4 Go control-plane services, deterministic sub-tools, and ✎ Edit close the loop.",
    slugs: [
      "live-command-portal",
      "prior-art-engine",
      "self-building-factory-loop",
      "deterministic-sub-tools",
      "ownership-map-and-edit-loop",
    ],
  },
  {
    tag: "Route 04 · Operations",
    title: "Self-hosting & contributing",
    body: "Run a Dockerless k3s or static copy on an air-gapped network, or build a tool for the catalog.",
    slugs: [
      "one-command-quickstart",
      "host-on-kubernetes",
      "closed-networks",
      "request-or-add-a-tool",
      "build-a-tool",
    ],
  },
];

const answers = [
  {
    question: "How is the site organized?",
    answer:
      "Top navigation stays focused on four links: Tools (all 18 browser utilities + 17 platform apps), Guides (all live factory views + field manuals), About, and GitHub.",
    slug: "navigating-this-site",
  },
  {
    question: "Where did Command, Apps, Pipeline, and Decide go?",
    answer:
      "All five interactive operational and evaluation pages live right here under Guides (/guides/command/, /guides/apps/, /guides/pipeline/, /guides/decide/, and /guides/how-we-decide/), and every app is also listed under /tools/#apps.",
    slug: "live-command-portal",
  },
  {
    question: "Do I need an account?",
    answer: "No. There are no accounts on this site, on the live factory views, or on any tool we ship.",
    slug: "getting-started",
  },
  {
    question: "Where does what I type go?",
    answer:
      "Nowhere in shipped tools. A contracting tool is only listed if all computation stays in your browser, and you can confirm that in DevTools in under a minute.",
    slug: "your-data",
  },
  {
    question: "Can I put a tool’s number straight into a bid?",
    answer:
      "Check it first. Every tool cites the governing regulation, and the official text of that regulation always wins over software.",
    slug: "checking-results",
  },
  {
    question: "Will it work on an air-gapped network with no Docker?",
    answer:
      "Yes. Static Snapshot Mode needs only plain file hosting, and full Platform Mode runs on k3s + containerd using ko and rootless BuildKit with zero Docker daemon.",
    slug: "closed-networks",
  },
];

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";

export default async function GuidesPage() {
  const guides = await listGuides();
  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  const find = (slug: string): Guide => {
    const guide = bySlug.get(slug);
    if (!guide) throw new Error(`The guides page links to "${slug}", which is not in src/guides.`);
    return guide;
  };

  const minutes = guides.reduce((total, guide) => total + guide.minutes, 0);
  const facts = [
    { value: String(factoryViews.length), label: "live factory views" },
    { value: String(guides.length), label: "field & system guides" },
    { value: `${Math.floor(minutes / 60)} h ${minutes % 60} min`, label: "total reading time" },
    { value: "$0.00", label: "and no login lock" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 lg:pt-14">
      <GuidesSubnav current="library" />

      {/* Introduction */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Section L">Instructions, field guides &amp; live factory</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
            Guides, live factory views, and the rules behind every tool.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Inspect the live Kubernetes Command Portal, Cluster App Store, 10-Worker Pipeline, Decide queue, and
            Section M rubric directly below—or read plain-language field guides on federal contracting, clean-room
            architecture, and air-gapped self-hosting.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4 lg:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse bg-surface px-4 py-3.5">
              <dt className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{fact.label}</dt>
              <dd className="font-mono text-xl font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Interactive Factory & Governance Views under /guides/* */}
      <section aria-labelledby="factory-views-title" className="mt-14 border-t-2 border-ink pt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <SectionLabel section="Section L.0">Interactive Factory &amp; Governance Views</SectionLabel>
            <h2 id="factory-views-title" className="mt-3 text-2xl font-semibold tracking-[-0.015em]">
              Inspect the running system with no login wall.
            </h2>
          </div>
          <DraftChip />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {factoryViews.map((view) => (
            <Link
              key={view.href}
              href={view.href}
              className="group flex flex-col justify-between rounded-sm border border-line bg-surface p-5 transition-colors hover:border-ink"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-accent">
                    {view.code} · {view.badge}
                  </span>
                  <HealthChip state={view.state} />
                </div>
                <h3 className="mt-2.5 text-lg font-semibold text-ink transition-colors group-hover:text-accent">
                  {view.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{view.body}</p>
              </div>
              <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-ink group-hover:text-accent">
                Open {view.href} →
              </p>
            </Link>
          ))}

          <Link
            href="/tools/#apps"
            className="group flex flex-col justify-between rounded-sm border border-dashed border-line bg-paper p-5 transition-colors hover:border-ink"
          >
            <div>
              <span className="font-mono text-xs text-accent">CLIN 0001–0006 · Unified Catalog</span>
              <h3 className="mt-2.5 text-lg font-semibold text-ink transition-colors group-hover:text-accent">
                All Tools &amp; Platform Apps
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Looking for a calculator, checklist, or microservice repository? All 18 contracting utilities and all
                17 platform/worker apps are indexed together under Tools.
              </p>
            </div>
            <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-ink group-hover:text-accent">
              Browse /tools/#apps →
            </p>
          </Link>
        </div>
      </section>

      {/* Reading routes */}
      <section aria-labelledby="routes-title" className="mt-16 border-t border-line pt-10">
        <SectionLabel>Reading routes</SectionLabel>
        <h2 id="routes-title" className="mt-3 text-2xl font-semibold tracking-[-0.015em]">
          Pick the track that matches why you are here.
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {routes.map((route) => (
            <div key={route.title} className="flex flex-col bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{route.tag}</p>
              <h3 className="mt-1.5 text-lg font-semibold">{route.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{route.body}</p>
              <ol className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
                {route.slugs.map(find).map((guide, index) => (
                  <li key={guide.slug} className="grid grid-cols-[1.5rem_1fr] items-baseline">
                    <span className="font-mono text-xs text-accent">{index + 1}</span>
                    <Link
                      href={`/guides/${guide.slug}/`}
                      className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                    >
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Every guide, by section */}
      <section aria-labelledby="all-title" className="mt-16 border-t border-line pt-10">
        <SectionLabel>Complete Manual (L.1–L.6)</SectionLabel>
        <h2 id="all-title" className="mt-3 text-2xl font-semibold tracking-[-0.015em]">
          Every guide, filterable by section or topic.
        </h2>
        <div className="mt-6">
          <Flow
            direction="across"
            caption="The six sections of the manual, from first visit to how the self-building factory is run."
            steps={guideGroups.map((group) => ({ tag: group.code, label: group.name }))}
            highlight={guideGroups.length - 1}
          />
        </div>
        <div className="mt-8">
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
      </section>

      {/* Short answers */}
      <section
        aria-labelledby="answers-title"
        className="mt-16 grid gap-x-16 gap-y-6 border-t border-line pt-10 lg:grid-cols-[15rem_minmax(0,1fr)]"
      >
        <div>
          <SectionLabel>Short answers</SectionLabel>
          <h2 id="answers-title" className="mt-3 text-2xl font-semibold tracking-[-0.015em]">
            Questions people ask first.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            More in{" "}
            <Link href="/guides/faq/" className={inlineLink}>
              {find("faq").title}
            </Link>
            .
          </p>
        </div>
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {answers.map((item) => (
            <div key={item.question} className="border-t-2 border-ink pt-4">
              <dt className="text-lg font-semibold leading-snug">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {item.answer}{" "}
                <Link href={`/guides/${item.slug}/`} className={inlineLink}>
                  {find(item.slug).title}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* What the guides are not */}
      <section className="mt-16 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <SectionLabel>Before you rely on a guide</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            The field guides explain public rules in plain language. They are not legal, accounting, or compliance
            advice, and rules change. Each regulatory guide names its official sources and the month it was last
            checked. When a guide and the current text of a regulation disagree, the regulation wins, and{" "}
            <Link href="/guides/public-sources/" className={inlineLink}>
              {find("public-sources").title}
            </Link>{" "}
            shows where to read it.
          </p>
        </div>
        <div>
          <SectionLabel>Missing or wrong</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            If a guide is unclear, out of date, or does not exist yet, say so. Click{" "}
            <code className="text-ink">✎ Edit</code> on any live view, open an issue on{" "}
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
