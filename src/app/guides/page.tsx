import type { Metadata } from "next";
import Link from "next/link";
import { AttentionCard } from "@/components/AttentionCard";
import { Branch, Flow, Lanes, Layers, States } from "@/components/Diagram";
import { EditTrigger } from "@/components/EditTrigger";
import { GuideIndex } from "@/components/GuideIndex";
import { GuidesWorkspace } from "@/components/GuidesWorkspace";
import { MetricCell } from "@/components/MetricCell";
import { PulseStrip } from "@/components/PulseStrip";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip, HealthChip } from "@/components/StatusChip";
import { TrailRow } from "@/components/TrailRow";
import { WhyDrawer } from "@/components/WhyDrawer";
import { liveCount, tools } from "@/data/catalog";
import { attentionRules, controlPlaneApps, workerApps } from "@/data/platform";
import { site } from "@/data/site";
import { guideGroups, listGuides, type Guide } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Section L & M · Guides, Command Portal, 10-Worker Pipeline, Decide Queue, and evaluation factors for ClearedStack.",
  alternates: { canonical: "/guides/" },
};

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
      "Top navigation stays focused on Home, Tools (18 browser utilities + 17 running platform apps), Guides (field manuals + integrated Command, Pipeline, Decide, and Section M views), About, and GitHub.",
    slug: "navigating-this-site",
  },
  {
    question: "Where are Command, Apps, Pipeline, and Decide?",
    answer:
      "Apps is integrated directly into Tools (/tools/#apps), and Command, Pipeline, Decide, and How We Decide are integrated right here on Guides via the section tabs above.",
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

const rubricFactors = [
  {
    name: "Need for small businesses",
    weight: "20 pts (×4)",
    score1: "Rare edge case; minimal time spent.",
    score3: "Occasional requirement (such as annual reporting).",
    score5: "Universal recurring blocker for small contractors; high manual friction or penalty if miscalculated.",
  },
  {
    name: "Gap: no free, private option exists",
    weight: "20 pts (×4)",
    score1: "Multiple high-quality, free, client-side tools already exist.",
    score3: "Government provides a clunky portal, or open tools exist with poor usability.",
    score5: "Only predatory paywalled SaaS or lead-generation traps exist; zero free tools available.",
  },
  {
    name: "Strength of the public source",
    weight: "15 pts (×3)",
    score1: "Informal agency slide deck or ambiguous draft.",
    score3: "Agency policy memo or fluctuating interim rule.",
    score5: "Codified statute, enacted Federal Regulation (FAR/DFARS), or ratified NIST standard.",
  },
  {
    name: "Fits in a browser",
    weight: "15 pts (×3)",
    score1: "Demands heavy multi-megabyte datasets or compute near browser memory limits.",
    score3: "Requires moderate bundled lookup tables (< 2 MB) or specialized parser.",
    score5: "Lightweight, pure mathematical or string transform (< 50 KB data, zero complex dependencies).",
  },
  {
    name: "Small enough to read",
    weight: "10 pts (×2)",
    score1: "Sprawling state machine with extensive configuration.",
    score3: "Moderate configuration with well-defined inputs and outputs.",
    score5: "Concise input-to-output function readable in one sitting (< 300 lines of core logic).",
  },
  {
    name: "Can be checked (worked examples exist)",
    weight: "10 pts (×2)",
    score1: "Highly subjective interpretation; high audit exposure if misapplied.",
    score3: "Mathematical formula with edge cases requiring prominent disclaimers.",
    score5: "Fully deterministic arithmetic with official government test vectors available to verify results.",
  },
  {
    name: "Low upkeep of reference data",
    weight: "10 pts (×2)",
    score1: "Requires frequent data updates or fragile web scraping.",
    score3: "Annual update schedule (such as fiscal year rate tables).",
    score5: "Static statutory logic; zero periodic data maintenance unless regulation is amended.",
  },
];

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";

export default async function GuidesPage() {
  const guides = await listGuides();
  const projectGuides = guides.filter((g) => g.group === "project");
  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  const find = (slug: string): Guide => {
    const guide = bySlug.get(slug);
    if (!guide) throw new Error(`The guides page links to "${slug}", which is not in src/guides.`);
    return guide;
  };

  const minutes = guides.reduce((total, guide) => total + guide.minutes, 0);
  const activeErrors = [...controlPlaneApps, ...workerApps].filter((a) => a.health === "erroring");
  const totalQueued = workerApps.reduce((sum, w) => sum + w.queued, 0);

  const facts = [
    { value: String(guides.length), label: "field & system guides" },
    { value: "4", label: "integrated factory views" },
    { value: `${Math.floor(minutes / 60)} h ${minutes % 60} min`, label: "total reading time" },
    { value: "$0.00", label: "and no login lock" },
  ];

  const manualView = (
    <>
      {/* Reading routes */}
      <section aria-labelledby="routes-title">
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
    </>
  );

  const commandView = (
    <div>
      <PulseStrip
        state={activeErrors.length > 0 ? "erroring" : "idle"}
        summary={`2 namespaces (clearedstack + cs-workers) · 0 records collected yet · Revised ${site.revised}`}
        metrics={[
          { label: "Control plane", value: String(controlPlaneApps.length), unit: "pods (~640 MiB)" },
          { label: "Workers", value: String(workerApps.length), unit: "pods (~300 MiB)" },
          { label: "Active errors", value: String(activeErrors.length), unit: "sanitized" },
          { label: "Runtime AI", value: "0", unit: "deterministic" },
        ]}
      />

      <section className="mt-10 border-b border-line pb-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel section="Command">Open Public Sandbox · No Login Lock</SectionLabel>
          <div className="flex items-center gap-2">
            <WhyDrawer
              title="Why a live command portal instead of static essays?"
              summary="Software rules—not AI—promote errors, stalled queues, and pending decisions to the top so anyone can see what is actually running."
              guideHref="/guides/live-command-portal/"
              details={[
                "View = f(state): deterministic priority rules decide what appears on screen.",
                "Zero AI at runtime: all 10 workers and all shipped tools run 100% deterministic code.",
                "No lock on it: everything running and being developed is public and free under MIT.",
                "Click Edit on any element to propose a change without signing in.",
              ]}
            />
            <EditTrigger
              elementId="portal.home.hero"
              ownerRepo="clearedstack.com"
              targetLabel="Command Portal Header"
              editClass="CONFIG"
            />
          </div>
        </div>

        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl">
          Software decides what’s on screen. Everything is public.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
          ClearedStack runs as a lightweight, Docker-free Kubernetes software factory alongside our free GovCon tool
          arsenal. Seven tiny Go microservices (<code className="text-ink">cs-git</code>,{" "}
          <code className="text-ink">cs-registry</code>, <code className="text-ink">cs-runner</code>,{" "}
          <code className="text-ink">cs-store</code>, Postgres, <code className="text-ink">hub-queue-api</code>, and
          this Portal) run alongside ten deterministic workers (<code className="text-ink">cs-01</code>–
          <code className="text-ink">cs-10</code>). No login wall, no hidden status, zero AI at runtime.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
          <Link
            href="/tools/#apps"
            className="rounded-sm bg-accent px-4 py-2 font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Cluster App Store (/tools/#apps) -&gt;
          </Link>
          <a
            href="#pipeline"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            10-Worker Pipeline (#pipeline)
          </a>
          <a
            href="#decide"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            Decisions &amp; Public Edits (#decide)
          </a>
          <Link
            href="/tools/"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            All Tools &amp; Apps ({liveCount}/{tools.length} tools + 17 apps)
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel>Attention Feed (P0–P2)</SectionLabel>
          <WhyDrawer
            title="Deterministic Attention Rules"
            summary="No language model ranks or summarizes this feed. Fixed rules promote failures and stalled queues first, and collapse quiet idle workers into one line."
            guideHref="/guides/software-decides-ui/"
            details={attentionRules.map((r) => `${r.tier}: ${r.trigger} -> ${r.behavior}`)}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <AttentionCard
            priority="P0"
            title="Active Cluster Errors"
            state={activeErrors.length > 0 ? "erroring" : "healthy"}
            errorCode={activeErrors.length > 0 ? "E_POD_UNHEALTHY" : undefined}
            summary="Sanitized error codes (E_TIMEOUT, E_PARSE, E_NEEDS_SUBTOOL) float here automatically when any pod fails. Internal IPs and node names are stripped by cs-store."
            ownerRepo="cs-store"
            elementId="command.attention.p0"
            editClass="ISSUE"
            whyTitle="How sanitized error codes work"
            whySummary="Workers emit standardized codes to hub-queue-api, while cs-store strips internal cluster IPs and node names from pod events."
            whyGuideHref="/guides/when-a-worker-is-red/"
            whyDetails={[
              `${activeErrors.length} active pod or worker errors right now.`,
              "Owner Mode in /tools/#apps provides 1-click Pause and Rollback across the last 5 digests.",
            ]}
          />

          <AttentionCard
            priority="P1"
            title="Queue & Sub-Tools"
            state="idle"
            errorCode={totalQueued > 0 ? `${totalQueued}_QUEUED` : undefined}
            summary={`Honest empty state: ${totalQueued} queued, 0 records collected yet. When a worker hits an unknown layout, it pauses in needs_subtool until a deterministic sub-tool and golden fixture are added.`}
            ownerRepo="clearedstack.com"
            elementId="command.attention.p1"
            editClass="ISSUE"
            whyTitle="Why unknown layouts fail closed"
            whySummary="Instead of guessing with an LLM at runtime, workers emit E_NEEDS_SUBTOOL and wait for a verified Go extractor + golden fixture."
            whyGuideHref="/guides/deterministic-sub-tools/"
            whyDetails={[
              "Priority lease order: urgent -> normal -> backfill.",
              "Paused items replay automatically when cs-store deploys the updated worker digest.",
            ]}
          />

          <AttentionCard
            priority="P2"
            title="Decisions & Public Edits"
            state="idle"
            summary="Anyone can click ✎ Edit on any element without signing in. Proposals wait in cs-04-decide, route via cs-10-notify to cs-git, build without Docker, and mirror to GitHub."
            ownerRepo="cs-04-decide"
            elementId="command.attention.p2"
            editClass="ISSUE"
            whyTitle="5-layer public edit loop"
            whySummary="Public proposals are screened by Proof-of-Work, honeypot, daily-salted IP limits, and ownership_map.json before entering cs-04-decide."
            whyGuideHref="/guides/ownership-map-and-edit-loop/"
            whyDetails={[
              "Nothing touches cs-git or the cluster until the human owner clicks Approve in #decide.",
              "Approved edits route directly to the owning repo defined in ownership_map.json.",
            ]}
          />
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <SectionLabel>cs-workers namespace</SectionLabel>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.015em]">Ten deterministic workers</h3>
          </div>
          <a
            href="#pipeline"
            className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4"
          >
            Inspect full pipeline -&gt;
          </a>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {workerApps.map((w) => (
            <div key={w.id} className="flex flex-col justify-between rounded-sm border border-line bg-surface p-3.5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-ink">{w.name}</span>
                  <HealthChip state={w.health} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{w.role}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2 font-mono text-[11px] text-muted">
                <span>{w.queued} queued</span>
                <EditTrigger
                  elementId={`worker.${w.id}.role`}
                  ownerRepo={w.ownerRepo}
                  targetLabel={w.name}
                  editClass="CONFIG"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <SectionLabel>clearedstack namespace · ~640 MiB control plane</SectionLabel>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.015em]">Seven clean-room MIT microservices</h3>
          </div>
          <Link
            href="/tools/#apps"
            className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4"
          >
            Open Cluster App Store (/tools/#apps) -&gt;
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {controlPlaneApps.map((app) => (
            <div key={app.id} className="rounded-sm border border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-ink">{app.name}</span>
                <span className="font-mono text-[11px] text-muted">{app.ramBudget}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{app.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const pipelineView = (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Pipeline">100% Deterministic · Zero AI at Runtime</SectionLabel>
        <div className="flex items-center gap-2">
          <DraftChip />
          <WhyDrawer
            title="How unique cases reinforce determinism"
            summary="When a worker sees an unknown layout, it never guesses with AI. It pauses in needs_subtool, opens a task in the worker repo via cs-10-notify, and replays automatically once a sub-tool + golden fixture is added."
            guideHref="/guides/deterministic-sub-tools/"
            details={[
              "0 records collected yet (honest empty state).",
              "Workers lease from hub-queue-api using priority lanes: urgent -> normal -> backfill.",
              "Each worker keeps a local spool volume so finished work survives hub restarts.",
            ]}
          />
        </div>
      </div>

      <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        The Ten Deterministic Workers
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Every worker lives in its own repository (<code className="text-ink">cs-01-intake</code> through{" "}
        <code className="text-ink">cs-10-notify</code>)—forming the 11-repository pipeline alongside{" "}
        <code className="text-ink">clearedstack.com</code>—and runs in <code className="text-ink">cs-workers</code>.
        Read the full evaluation gates and 14-state lifecycle in{" "}
        <a href="#how-we-decide" className="text-accent underline underline-offset-4">
          How we decide (Section M)
        </a>
        .
      </p>

      <div className="mt-6">
        <PulseStrip
          state="empty"
          summary="0 records collected yet · all 10 deterministic workers idle and ready"
          metrics={[
            { label: "Urgent lane", value: "0", unit: "items" },
            { label: "Normal lane", value: "0", unit: "items" },
            { label: "Backfill lane", value: "0", unit: "items" },
            { label: "needs_subtool", value: "0", unit: "paused" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricCell label="Priority order" value="urgent → normal → backfill" />
        <MetricCell label="Runtime AI calls" value="0" unit="100% deterministic" />
        <MetricCell label="Local spool" value="/var/spool/cs" unit="survives hub restart" />
      </div>

      <div className="mt-8 space-y-3">
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted">Item Trail Preview (PA-XXXX)</h3>
        <TrailRow
          id="PA-0000"
          label="Nothing collected yet"
          detail="Submit a candidate or propose an edit with ✎ to start the 10-worker deterministic trail."
          lane="normal"
          state="empty"
          timestamp="initial"
        />
      </div>

      <div className="mt-10 space-y-4">
        {workerApps.map((w, idx) => (
          <div
            key={w.id}
            className="grid gap-4 rounded-sm border border-line bg-surface p-5 md:grid-cols-[14rem_1fr_auto] md:items-center"
          >
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Worker {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-ink">{w.name}</div>
              <div className="mt-2">
                <HealthChip state={w.health} label={`${w.queued} queued`} />
              </div>
            </div>

            <div>
              <p className="text-sm leading-relaxed text-ink">{w.role}</p>
              <p className="mt-1.5 text-xs text-muted">{w.notes}</p>
              {w.subTools.length > 0 && (
                <p className="mt-2 font-mono text-xs text-muted">
                  Sub-tools (<code className="text-ink">tools/&lt;case&gt;/</code>):{" "}
                  <span className="text-ink">{w.subTools.join(" · ")}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 md:justify-end">
              <EditTrigger
                elementId={`pipeline.${w.id}`}
                ownerRepo={w.ownerRepo}
                targetLabel={w.name}
                editClass="ISSUE"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const decideView = (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Decide">cs-04-decide · Public Decision &amp; Edit Queue</SectionLabel>
        <div className="flex items-center gap-2">
          <DraftChip />
          <WhyDrawer
            title="How anonymous edits work with no login lock"
            summary="Anyone can propose edits on any element without signing in. Proposals pass a 5-layer anti-spam shield, wait in cs-04-decide, and route via cs-10-notify to cs-git when approved."
            guideHref="/guides/anonymous-edits-and-anti-spam/"
            details={[
              "Browser proof-of-work + honeypot + daily-salted IP rate limit (no raw IPs stored).",
              "Strict 4 KB schema validation against ownership_map.json.",
              "Approved edits go to cs-git, build via cs-runner, deploy via cs-store, and mirror to GitHub.",
            ]}
          />
        </div>
      </div>

      <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        Decisions &amp; Public Edit Proposals
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        There is no lock on this site. Every scored candidate waiting for determination and every anonymous{" "}
        <code className="text-ink">✎ Edit</code> proposal from visitors appears here transparently. See the full 5-gate
        screening rules and 100-point rubric in{" "}
        <a
          href="#how-we-decide"
          className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
        >
          How we decide (Section M)
        </a>
        .
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-sm border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">
              Candidate Decisions (cs-04-decide)
            </h3>
            <HealthChip state="idle" label="0 waiting" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Honest empty state: 0 scored candidates are waiting for a determination yet. Once{" "}
            <code className="text-ink">cs-01-intake</code> through <code className="text-ink">cs-03-evaluate</code> run,
            scored items appear here for Build, Link, Merge, Park, or Reject.
          </p>
        </div>

        <div className="rounded-sm border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">
              Anonymous Edit Proposals (core.edit_proposal)
            </h3>
            <HealthChip state="idle" label="0 pending" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Click <code className="text-ink">✎ Edit</code> anywhere on the Portal—or try it right here—to see how a
            public proposal routes to its owning repository via <code className="text-ink">ownership_map.json</code>.
          </p>
          <div className="mt-4">
            <EditTrigger
              elementId="decide.sandbox.test"
              ownerRepo="clearedstack.com"
              targetLabel="Test anonymous edit proposal"
              editClass="ISSUE"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const howWeDecideView = (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Section M">Evaluation factors</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl">
        How we decide what to build.
      </h2>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        In federal contracting, Section M of a solicitation sets forth the evaluation factors for award: how proposals
        will be graded and how the winning contractor is chosen. ClearedStack adopts this structure to disclose how we
        evaluate tool ideas, screen candidates against non-negotiable gates, score them on an open rubric, and credit
        their provenance.
      </p>

      <div className="mt-8 rounded-sm border border-line border-l-2 border-l-ink bg-surface p-5">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
          v3.1 Architecture · 100% deterministic at runtime
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          ClearedStack v3.1 runs this evaluation system across ten separate, MIT-licensed, 100% deterministic Go worker
          repositories (<code className="text-ink">cs-01-intake</code> through{" "}
          <code className="text-ink">cs-10-notify</code>) in <code className="text-ink">cs-workers</code>, coordinated
          by <code className="text-ink">hub-queue-api</code> and Postgres. Explore the integrated{" "}
          <a href="#pipeline" className="text-ink underline decoration-accent underline-offset-4">
            Pipeline view
          </a>{" "}
          and{" "}
          <a href="#decide" className="text-ink underline decoration-accent underline-offset-4">
            Decide inbox
          </a>
          .
        </p>
      </div>

      {/* The Ten Workers */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Pipeline</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">
          The ten deterministic workers
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Every tool idea progresses through ten 100% deterministic worker repositories with zero AI at runtime. Each
          worker pulls leased work from <code className="text-ink">hub-queue-api</code>, handles edge cases with
          deterministic <code className="text-ink">tools/&lt;case&gt;/</code> sub-tools, and fails closed into{" "}
          <code className="text-ink">needs_subtool</code> if it encounters an unfamiliar layout.
        </p>

        <div className="mt-8">
          <Flow
            caption="The ten deterministic worker repositories (cs-01-intake through cs-10-notify) in the cs-workers namespace."
            direction="down"
            loop="cs-09-monitor feeds regulatory drift back to cs-06-build and cleared blockers back to cs-02-observe; cs-10-notify routes approved Portal edits and needs_subtool tasks into cs-git."
            steps={[
              {
                tag: "cs-01-intake",
                label: "Intake & Dedupe",
                detail: "Normalizes URLs, deduplicates via SHA-256, and assigns a permanent PA-XXXX ID.",
              },
              {
                tag: "cs-02-observe",
                label: "Observe & Seal",
                detail:
                  "Fetches public pages (~30 MiB Go HTTP pods + on-demand browser Jobs) and seals raw snapshots behind the clean-room wall.",
              },
              {
                tag: "cs-03-evaluate",
                label: "Screen & Score",
                detail:
                  "Runs 5 binary knockout gates, the 100-point rubric, and 5 tie-breakers using deterministic YAML/Go rules.",
              },
              {
                tag: "cs-04-decide",
                label: "Human Decide",
                detail:
                  "Powers the #decide inbox for tool outcomes (Approve, Link, Merge, Park, Reject) and anonymous public edit approvals.",
              },
              {
                tag: "cs-05-provenance",
                label: "Credit & Spec",
                detail:
                  "Stamps Go-template provenance notes, enforces 48h/5d SLAs (48h identity check, 5d opt-out), and compiles sanitized JSON build specs.",
              },
              {
                tag: "cs-06-build",
                label: "Clean-Room Build",
                detail: "Generates an isolated MIT static tool repository from the clean-room spec and stack templates.",
              },
              {
                tag: "cs-07-verify",
                label: "5-Condition QA",
                detail:
                  "Verifies offline execution, connect-src 'self', zero tracking, worked examples, and citations.",
              },
              {
                tag: "cs-08-catalog",
                label: "Catalog Publish",
                detail: "Publishes verified, linked, merged, or retired entries to the live /tools catalog.",
              },
              {
                tag: "cs-09-monitor",
                label: "Scheduled Monitor",
                detail:
                  "Runs ETag, XML, and DOM diff checks on FAR/DFARS/NIST feeds, live tools, linked tools, and parked blockers.",
              },
              {
                tag: "cs-10-notify",
                label: "Notify & Route",
                detail:
                  "Deduplicates errors by fingerprint, routes approved Portal edits and needs_subtool tasks into cs-git, and streams SSE updates.",
              },
            ]}
          />
        </div>
      </section>

      {/* Record Lifecycle */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Lifecycle</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">The record lifecycle</h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Every idea in the Prior Art database exists in one explicit state. A record moves between states only when a
          logged event occurs, preserving a complete audit trail.
        </p>

        <div className="mt-8">
          <States
            caption="Record state transitions from initial discovery to catalog publication or terminal archival."
            states={[
              {
                id: "discovered",
                tag: "Initial",
                label: "Discovered",
                detail: "Candidate URL or suggestion captured.",
                to: [{ id: "recorded", when: "assigned a PA-XXXX identifier and deduplicated" }],
              },
              {
                id: "recorded",
                label: "Recorded",
                detail: "Cataloged in the dataset queue.",
                to: [{ id: "observed", when: "public pages, inputs, and outputs are documented" }],
              },
              {
                id: "observed",
                label: "Observed",
                detail: "Public footprint and citations logged (raw snapshot sealed).",
                to: [
                  { id: "screened_out", when: "candidate fails any knockout gate" },
                  { id: "scored", when: "candidate clears all five knockout gates" },
                  { id: "needs_subtool", when: "unknown page layout (fail closed)" },
                ],
              },
              {
                id: "needs_subtool",
                tag: "Fail-closed pause",
                label: "Needs sub-tool",
                detail: "Paused until a deterministic tools/<case>/ sub-tool is deployed, then auto-replayed.",
                to: [{ id: "observed", when: "new deterministic sub-tool deployed by cs-store" }],
              },
              {
                id: "screened_out",
                tag: "Terminal / Reopenable",
                label: "Screened out",
                detail: "Disqualified with non-compliance reason logged.",
                to: [{ id: "observed", when: "scope changes or candidate is restructured (owner only)" }],
              },
              {
                id: "scored",
                label: "Scored",
                detail: "Graded on the 100-point rubric.",
                to: [
                  { id: "approved", when: "owner approves clean-room build (score ≥ 75)" },
                  { id: "linked", when: "equivalent free, private tool already exists" },
                  { id: "merged", when: "candidate is a feature of an existing tool" },
                  { id: "parked", when: "viable but deferred or blocked (score 55–74)" },
                  { id: "rejected", when: "fails viability threshold (score < 55)" },
                ],
              },
              {
                id: "parked",
                tag: "Deferred",
                label: "Parked",
                detail: "Held in reserve with a named blocker.",
                to: [{ id: "observed", when: "named blocker is resolved on monthly revisit" }],
              },
              {
                id: "approved",
                tag: "Catalog: planned",
                label: "Approved",
                detail: "Scheduled for clean-room implementation.",
                to: [{ id: "building", when: "repository created and code development begins" }],
              },
              {
                id: "building",
                tag: "Catalog: building",
                label: "Building",
                detail: "Active implementation and test writing.",
                to: [{ id: "live", when: "passes all five listing conditions" }],
              },
              {
                id: "live",
                tag: "Catalog: live",
                label: "Live",
                detail: "Published in the active catalog with provenance.",
                to: [{ id: "retired", when: "governing regulation is repealed or superseded" }],
              },
              {
                id: "rejected",
                tag: "End state",
                label: "Rejected",
                detail: "Candidate disqualified. Reason and rubric score permanently archived.",
              },
              {
                id: "linked",
                tag: "End state",
                label: "Linked",
                detail: "Existing free tool referenced in documentation. Rebuild avoided.",
              },
              {
                id: "merged",
                tag: "End state",
                label: "Merged",
                detail: "Absorbed into parent tool issue tracker as an enhancement.",
              },
              {
                id: "retired",
                tag: "End state",
                label: "Retired",
                detail: "Tool deprecated due to statutory amendment or obsolescence.",
              },
            ]}
          />
        </div>
      </section>

      {/* Five Knockout Gates */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Knockout gates</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">Five binary screening gates</h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Before any candidate is scored, it must clear five non-negotiable gates. A failure on any single gate halts
          the evaluation immediately. There is no partial credit and no waiver.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li className="border-t-2 border-ink pt-3">
            <span className="font-mono text-xs text-accent">Gate 1</span>
            <strong className="mt-1 block text-base font-semibold">Public source</strong>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Formulas, thresholds, and logic must originate in officially released public material: FAR, DFARS, CFR,
              or NIST standards. No proprietary consulting frameworks or leaked drafts.
            </p>
          </li>
          <li className="border-t-2 border-ink pt-3">
            <span className="font-mono text-xs text-accent">Gate 2</span>
            <strong className="mt-1 block text-base font-semibold">Runs in the browser</strong>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              All computation, document parsing, and file generation must execute entirely in the client browser. No
              backend server, database, or remote API processing allowed.
            </p>
          </li>
          <li className="border-t-2 border-ink pt-3">
            <span className="font-mono text-xs text-accent">Gate 3</span>
            <strong className="mt-1 block text-base font-semibold">Private by design</strong>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Must operate under a strict Content Security Policy. No user accounts, cookies, telemetry, or analytics.
              Must function in offline or air-gapped environments.
            </p>
          </li>
          <li className="border-t-2 border-ink pt-3">
            <span className="font-mono text-xs text-accent">Gate 4</span>
            <strong className="mt-1 block text-base font-semibold">One job</strong>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Must perform one discrete job, describable in a single sentence starting with an active verb. Complex
              multi-step platforms failing this gate may be split into separate tools.
            </p>
          </li>
          <li className="border-t-2 border-ink pt-3">
            <span className="font-mono text-xs text-accent">Gate 5</span>
            <strong className="mt-1 block text-base font-semibold">Arithmetic, not advice</strong>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Computes, structures, or looks up data objectively. Never delivers subjective legal opinions, win-rate
              predictions, or discretionary contracting officer determinations.
            </p>
          </li>
        </ol>

        <div className="mt-8">
          <Branch
            caption="The knockout screening decision: pass all five or route to screened out."
            question="Does the candidate clear all five knockout gates?"
            options={[
              {
                when: "Passes all five",
                then: "Proceed to scoring rubric",
                detail: "Graded across seven weighted factors up to 100 points.",
              },
              {
                when: "Fails any gate",
                then: "Screened out",
                detail: "Reason published in decision log; multi-job candidates may be split into atomic ideas.",
              },
            ]}
          />
        </div>
      </section>

      {/* The Scoring Rubric */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Rubric</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">The 100-point scoring rubric</h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Candidates clearing all five knockout gates are scored on seven factors from 1 to 5. Each score is multiplied
          by a fixed weight, producing a composite score out of 100 points. All draft scores and rationales are
          published openly.
        </p>

        <div className="mt-8 overflow-x-auto rounded-sm border border-line bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              The seven evaluation factors and point weights of the Prior Art rubric.
            </caption>
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                <th scope="col" className="py-3 pl-4 pr-3 sm:pl-5">
                  Factor
                </th>
                <th scope="col" className="px-3 py-3 font-mono">
                  Weight
                </th>
                <th scope="col" className="hidden px-3 py-3 lg:table-cell">
                  Score 1 (Low)
                </th>
                <th scope="col" className="hidden px-3 py-3 md:table-cell">
                  Score 3 (Mid)
                </th>
                <th scope="col" className="py-3 pl-3 pr-4 sm:pr-5">
                  Score 5 (High)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rubricFactors.map((factor) => (
                <tr key={factor.name}>
                  <td className="py-3.5 pl-4 pr-3 align-top font-medium text-ink sm:pl-5">{factor.name}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 align-top font-mono text-xs text-accent">
                    {factor.weight}
                  </td>
                  <td className="hidden px-3 py-3.5 align-top text-xs text-muted lg:table-cell">{factor.score1}</td>
                  <td className="hidden px-3 py-3.5 align-top text-xs text-muted md:table-cell">{factor.score3}</td>
                  <td className="py-3.5 pl-3 pr-4 align-top text-xs leading-relaxed text-muted sm:pr-5">
                    {factor.score5}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line font-mono text-xs font-semibold">
                <th scope="row" className="py-3 pl-4 pr-3 sm:pl-5">
                  Total points
                </th>
                <td className="px-3 py-3 text-accent">100 pts</td>
                <td colSpan={3} className="hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8">
          <Layers
            caption="Scoring rubric breakdown: factor weights totaling 100 possible points."
            layers={[
              {
                tag: "20 pts · ×4",
                label: "Need for small businesses",
                detail:
                  "Universal, recurring blocker for small contractors with high friction or penalty if miscalculated.",
              },
              {
                tag: "20 pts · ×4",
                label: "Gap: no free, private option exists",
                detail:
                  "Zero free, client-side options exist; only paywalled SaaS or lead-generation traps are available.",
              },
              {
                tag: "15 pts · ×3",
                label: "Strength of the public source",
                detail:
                  "Directly grounded in enacted Federal Regulation (FAR/DFARS), statute, or ratified NIST standard.",
              },
              {
                tag: "15 pts · ×3",
                label: "Fits in a browser",
                detail: "Pure mathematical or string transform with minimal bundled reference data (< 50 KB).",
              },
              {
                tag: "10 pts · ×2",
                label: "Small enough to read",
                detail: "Single-job scope with concise core logic readable and auditable in one sitting (< 300 LOC).",
              },
              {
                tag: "10 pts · ×2",
                label: "Can be checked (worked examples exist)",
                detail: "Fully deterministic arithmetic with published government worked examples or test vectors.",
              },
              {
                tag: "10 pts · ×2",
                label: "Low upkeep of reference data",
                detail: "Static statutory formulas requiring updates only when primary regulations are amended.",
              },
            ]}
          />
        </div>
      </section>

      {/* Decision Outcomes */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Outcomes</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">What does the owner decide?</h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Scores are advisory. The human maintainer makes every final determination in{" "}
          <a href="#decide" className="text-ink underline decoration-accent underline-offset-4">
            Decide (#decide)
          </a>{" "}
          and records the rationale in the public decision log. The rubric maps to five distinct outcomes:
        </p>

        <div className="mt-8">
          <Branch
            caption="Decision outcomes governed by composite rubric scores and existing market alternatives."
            question="What does the owner decide?"
            options={[
              {
                when: "Score ≥ 75",
                then: "Build",
                detail: "ClearedStack writes its own free, client-side version. Enters catalog as planned.",
              },
              {
                when: "Score ≥ 70 & Gap = 1",
                then: "Link",
                detail: "An acceptable free tool already exists. Link to it in guides or catalog instead of rebuilding.",
              },
              {
                when: "Belongs to existing tool",
                then: "Merge",
                detail: "Not a standalone tool; absorbed as an enhancement issue in an existing tool repository.",
              },
              {
                when: "Score 55–74 or blocked",
                then: "Park",
                detail: "Viable idea deferred due to technical constraints or capacity; revisited on monthly checks.",
              },
              {
                when: "Score < 55 or fails gate",
                then: "Reject",
                detail: "Disqualified with explicit reasons and score breakdown published in the decision log.",
              },
            ]}
          />
        </div>
      </section>

      {/* Who Does What: Swimlanes */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Accountability</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">Who does what</h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          AI agents assist at authoring time with drafting code, tests, and documentation—never at runtime. The human
          owner holds sole legal, editorial, and architectural accountability, while the community audits work and
          proposes improvements.
        </p>

        <div className="mt-8">
          <Lanes
            caption="Division of responsibilities across the human maintainer, authoring-time AI agents, and the community."
            lanes={["Owner", "AI agents (authoring time only)", "Community"]}
            steps={[
              {
                lane: 2,
                label: "Suggest candidate or edit",
                detail: "Opens a GitHub issue or clicks ✎ Edit on any Portal element with zero login wall.",
              },
              {
                lane: 1,
                label: "Draft deterministic sub-tools",
                detail: "Helps author Go extractors, YAML rubric profiles, and golden test fixtures offline.",
              },
              {
                lane: 0,
                label: "Verify knockout gates & rules",
                detail: "Audits public source integrity, client-side feasibility, and deterministic scoring profiles.",
              },
              {
                lane: 0,
                label: "Decide the outcome",
                detail: "Makes final determination in cs-04-decide: Build, Link, Merge, Park, or Reject; logs overrides.",
              },
              {
                lane: 1,
                label: "Draft clean-room tool code",
                detail: "Writes browser tool code, unit tests, and guides strictly from the primary regulation.",
              },
              {
                lane: 0,
                label: "Audit math and citations",
                detail: "Checks every calculation and regulatory citation against official sources before merging.",
              },
              {
                lane: 2,
                label: "Audit live tools",
                detail: "Verifies formulas, reports regulatory updates, and submits improvements via ✎ Edit or GitHub.",
              },
            ]}
          />
        </div>
      </section>

      {/* Credit and Clean-Room Rules */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Provenance</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">Credit and clean-room rules</h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          ClearedStack credits where ideas come from while maintaining an absolute clean-room boundary. We build from
          public statutes, never from third-party proprietary work.
        </p>

        <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <div className="border-t-2 border-ink pt-3">
            <dt className="font-semibold text-ink">What we take</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              Only the <em>idea of a job to be done</em> (for example, “calculate indirect rates under FAR 31.203”). We
              never take code, text, screenshots, user interface layouts, data files, product names, or trademarks.
            </dd>
          </div>
          <div className="border-t-2 border-ink pt-3">
            <dt className="font-semibold text-ink">Clean-room source</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              Builders work solely from the public regulation and the sanitized specification from{" "}
              <code className="text-ink">cs-05-provenance</code>, never from the inspected third-party software.
            </dd>
          </div>
          <div className="border-t-2 border-ink pt-3">
            <dt className="font-semibold text-ink">Provenance note template</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              “Idea seen in: Tool A (Vendor V), observed YYYY-MM from its public pages. What we took: the job — [one
              sentence]. What we did differently: runs entirely in your browser, free, no account; built from
              [Regulation R].” Factual, neutral, and without quality comparisons.
            </dd>
          </div>
          <div className="border-t-2 border-ink pt-3">
            <dt className="font-semibold text-ink">Corrections and opt-outs (48h / 5d SLA)</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              A tool owner can request factual corrections or ask to have their name removed from attribution. Identity
              verification starts within 48 hours and valid opt-out requests are completed within 5 business days: the
              note then credits “a commercial product,” while citation to the public regulation remains permanent.
            </dd>
          </div>
        </dl>
      </section>

      {/* L.6 Project Guides */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel section="Section L.6">Project guides</SectionLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.015em] text-balance">
          Read the complete specifications
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          The full details of the 10-worker Prior Art engine, observation protocols, deterministic sub-tools, AI
          policies, and clean-room boundaries are documented across {projectGuides.length} dedicated Section L.6
          guides:
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {projectGuides.map((guide) => (
            <li key={guide.slug} className="flex flex-col rounded-sm border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-accent">{guide.code}</span>
                {guide.draft ? <DraftChip /> : null}
              </div>
              <h4 className="mt-1.5 font-semibold text-ink">
                <Link
                  href={`/guides/${guide.slug}/`}
                  className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {guide.title}
                </Link>
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{guide.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
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
            Read plain-language field guides on federal contracting, clean-room architecture, and air-gapped
            self-hosting—or switch straight to the integrated Command Portal, 10-Worker Pipeline, Decide Queue, and
            Section M evaluation rubric right on this page.
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

      <GuidesWorkspace
        guideCount={guides.length}
        manualView={manualView}
        commandView={commandView}
        pipelineView={pipelineView}
        decideView={decideView}
        howWeDecideView={howWeDecideView}
      />
    </div>
  );
}
