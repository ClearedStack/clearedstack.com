import type { Metadata } from "next";
import Link from "next/link";
import { Branch, Flow, Lanes, Layers, States } from "@/components/Diagram";
import { SectionLabel } from "@/components/SectionLabel";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "How We Decide",
  description:
    "Section M · Evaluation factors: how ClearedStack evaluates tool candidates, screens against knockout gates, scores with a 100-point rubric, and credits inspirations without copying.",
  alternates: { canonical: "/how-we-decide/" },
};

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

const guides = [
  {
    slug: "prior-art-engine",
    title: "How the project chooses what to build",
    body: "The end-to-end Prior Art engine architecture, rationale, and governing standards.",
  },
  {
    slug: "find-candidates",
    title: "How candidates are found",
    body: "Systematic sweeps across public sources, community issues, and category coverage.",
  },
  {
    slug: "observe-a-tool",
    title: "How an existing tool is observed",
    body: "The passive observation protocol: public pages only, zero logins, and verifiable evidence snapshots.",
  },
  {
    slug: "score-and-decide",
    title: "How an idea is scored and decided",
    body: "The five knockout gates, 100-point rubric mechanics, threshold rules, and public decision logs.",
  },
  {
    slug: "credit-and-clean-room",
    title: "How ideas are credited",
    body: "Clean-room development rules, provenance notes, opt-out policies, and intellectual property boundaries.",
  },
  {
    slug: "built-with-ai",
    title: "How AI is used to build this project",
    body: "The strict division between authoring-time AI assistance and zero-AI runtime execution.",
  },
  {
    slug: "open-questions",
    title: "What is not decided yet",
    body: "Unresolved architectural questions, dataset licensing, and long-term community stewardship.",
  },
];

export default function HowWeDecidePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Section M">Evaluation factors</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-5xl">
        How we decide what to build.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        In federal contracting, Section M of a solicitation sets forth the evaluation factors for award: how proposals
        will be graded and how the winning contractor is chosen. ClearedStack adopts this structure to disclose how we
        evaluate tool ideas, screen candidates against non-negotiable gates, score them on an open rubric, and credit
        their provenance.
      </p>

      {/* Prominent Draft Notice */}
      <div className="mt-8 rounded-sm border border-line border-l-2 border-l-ink bg-surface p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
          Draft · Pure intent
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This page describes intent. The Prior Art engine is not running yet. No repository{" "}
          <code className="text-ink">ClearedStack/prior-art</code> exists, and nothing has been collected. All 18
          planned tools currently listed in the catalog were selected by the maintainer before this process was
          formalized; their provenance is not yet recorded and will be back-filled through this exact pipeline.
        </p>
      </div>

      {/* The Ten Stages */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Pipeline</SectionLabel>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          The ten stages of a candidate tool
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Every tool idea progresses through ten deterministic stages. Each step produces a permanent public record,
          ensuring full transparency from the moment an idea is noticed to when it ships or is retired.
        </p>

        <div className="mt-8">
          <Flow
            caption="The ten stages of the Prior Art pipeline, from initial discovery through monthly revisit."
            direction="down"
            loop="Revisit feeds back into Observe (for parked or linked records) or Build (for live tools needing changes)."
            steps={[
              {
                tag: "Stage 1",
                label: "Discover",
                detail: "Find a candidate via automated agent sweeps, maintainer research, or community GitHub issues.",
              },
              {
                tag: "Stage 2",
                label: "Record",
                detail: "Assign a permanent PA-XXXX identifier and deduplicate across URLs, forks, and white-labels.",
              },
              {
                tag: "Stage 3",
                label: "Observe",
                detail: "Examine public pages only: document inputs, outputs, rules, licenses, and archived snapshots.",
              },
              {
                tag: "Stage 4",
                label: "Screen",
                detail: "Test against five binary knockout gates. Any failure routes immediately to Screened Out.",
              },
              {
                tag: "Stage 5",
                label: "Score",
                detail: "Evaluate across seven weighted factors on a 100-point rubric. Scores and rationale are public.",
              },
              {
                tag: "Stage 6",
                label: "Decide",
                detail: "Human owner selects one of five outcomes: Build, Link, Merge, Park, or Reject.",
              },
              {
                tag: "Stage 7",
                label: "Credit",
                detail: "Draft the provenance note attributing the job to the inspiration without copying proprietary work.",
              },
              {
                tag: "Stage 8",
                label: "Build",
                detail: "Clean-room development in an independent repository from the public regulation. Status: planned → building.",
              },
              {
                tag: "Stage 9",
                label: "List",
                detail: "Verify all five listing conditions. Catalog status moves to live with provenance displayed.",
              },
              {
                tag: "Stage 10",
                label: "Revisit",
                detail: "Monthly check: have regulations changed, observed tools moved, or listed tools aged out?",
              },
            ]}
          />
        </div>
      </section>

      {/* Record Lifecycle */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Lifecycle</SectionLabel>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          The record lifecycle
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Every idea in the Prior Art database exists in one explicit state. A record moves between states only when
          a logged event occurs, preserving a complete audit trail.
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
                detail: "Public footprint and citations logged.",
                to: [
                  { id: "screened_out", when: "candidate fails any knockout gate" },
                  { id: "scored", when: "candidate clears all five knockout gates" },
                ],
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
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          Five binary screening gates
        </h2>
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
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          The 100-point scoring rubric
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Candidates clearing all five knockout gates are scored on seven factors from 1 to 5. Each score is multiplied
          by a fixed weight, producing a composite score out of 100 points. All draft scores and rationales are
          published openly.
        </p>

        {/* Rubric Table */}
        <div className="mt-8 overflow-x-auto rounded-sm border border-line bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">The seven evaluation factors and point weights of the Prior Art rubric.</caption>
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                <th scope="col" className="py-3 pl-4 pr-3 sm:pl-5">Factor</th>
                <th scope="col" className="px-3 py-3 font-mono">Weight</th>
                <th scope="col" className="hidden px-3 py-3 lg:table-cell">Score 1 (Low)</th>
                <th scope="col" className="hidden px-3 py-3 md:table-cell">Score 3 (Mid)</th>
                <th scope="col" className="py-3 pl-3 pr-4 sm:pr-5">Score 5 (High)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rubricFactors.map((factor) => (
                <tr key={factor.name}>
                  <td className="py-3.5 pl-4 pr-3 align-top font-medium text-ink sm:pl-5">
                    {factor.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 align-top font-mono text-xs text-accent">
                    {factor.weight}
                  </td>
                  <td className="hidden px-3 py-3.5 align-top text-xs text-muted lg:table-cell">
                    {factor.score1}
                  </td>
                  <td className="hidden px-3 py-3.5 align-top text-xs text-muted md:table-cell">
                    {factor.score3}
                  </td>
                  <td className="py-3.5 pl-3 pr-4 align-top text-xs leading-relaxed text-muted sm:pr-5">
                    {factor.score5}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line font-mono text-xs font-semibold">
                <th scope="row" className="py-3 pl-4 pr-3 sm:pl-5">Total points</th>
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
                detail: "Universal, recurring blocker for small contractors with high friction or penalty if miscalculated.",
              },
              {
                tag: "20 pts · ×4",
                label: "Gap: no free, private option exists",
                detail: "Zero free, client-side options exist; only paywalled SaaS or lead-generation traps are available.",
              },
              {
                tag: "15 pts · ×3",
                label: "Strength of the public source",
                detail: "Directly grounded in enacted Federal Regulation (FAR/DFARS), statute, or ratified NIST standard.",
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
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          What does the owner decide?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Scores are advisory. The human maintainer makes every final determination and records the rationale in the
          public decision log. The rubric maps to five distinct outcomes:
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
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          Who does what
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          AI agents assist with drafting, research sweeps, and initial evaluations. The human owner holds sole legal,
          editorial, and architectural accountability. The community audits work and identifies candidates.
        </p>

        <div className="mt-8">
          <Lanes
            caption="Division of responsibilities across the human maintainer, AI drafting agents, and the community."
            lanes={["Owner", "AI agents (Claude Code, Antigravity)", "Community"]}
            steps={[
              {
                lane: 2,
                label: "Suggest candidate tool",
                detail: "Opens a GitHub issue identifying a repetitive paperwork problem or public regulation.",
              },
              {
                lane: 1,
                label: "Draft observation record",
                detail: "Collects public page details, inputs, outputs, licenses, and official regulatory citations.",
              },
              {
                lane: 0,
                label: "Evaluate knockout gates",
                detail: "Verifies public source integrity, client-side feasibility, and single-job scope.",
              },
              {
                lane: 1,
                label: "Draft rubric scores",
                detail: "Proposes 1–5 ratings with written rationale across the seven evaluation factors.",
              },
              {
                lane: 0,
                label: "Decide the outcome",
                detail: "Makes final determination: Build, Link, Merge, Park, or Reject; logs any overrides.",
              },
              {
                lane: 1,
                label: "Draft clean-room code",
                detail: "Writes browser tool code, unit tests, and documentation from the primary regulation.",
              },
              {
                lane: 0,
                label: "Audit math and citations",
                detail: "Checks every calculation and regulatory citation against official sources before merging.",
              },
              {
                lane: 2,
                label: "Audit live tools",
                detail: "Verifies formulas, reports regulatory updates, and submits improvements via GitHub.",
              },
            ]}
          />
        </div>
      </section>

      {/* Credit and Clean-Room Rules */}
      <section className="mt-16 border-t border-line pt-12">
        <SectionLabel>Provenance</SectionLabel>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          Credit and clean-room rules
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          ClearedStack credits where ideas come from while maintaining an absolute clean-room boundary. We build from
          public statutes, never from third-party proprietary work.
        </p>

        <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <div className="border-t-2 border-ink pt-3">
            <dt className="font-semibold text-ink">What we take</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              Only the <em>idea of a job to be done</em> (for example, “calculate indirect rates under FAR 31.203”).
              We never take code, text, screenshots, user interface layouts, data files, product names, or trademarks.
            </dd>
          </div>
          <div className="border-t-2 border-ink pt-3">
            <dt className="font-semibold text-ink">Clean-room source</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              Builders work solely from the public regulation and the architectural decision specification, never from
              the inspected third-party software.
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
            <dt className="font-semibold text-ink">Corrections and opt-outs</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">
              A tool owner can request factual corrections or ask to have their name removed from attribution. Opt-out
              requests are honored: the note then credits “a commercial product,” while citation to the public
              regulation remains permanent.
            </dd>
          </div>
        </dl>
      </section>

      {/* L.6 Project Guides */}
      <section className="mt-16 border-t border-line py-12 lg:py-16">
        <SectionLabel section="Section L.6">Project guides</SectionLabel>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.015em] text-balance">
          Read the complete specifications
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          The full details of the Prior Art engine, observation protocols, AI policies, and ethical boundaries are
          documented across seven dedicated guides:
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <li key={guide.slug} className="flex flex-col rounded-sm border border-line bg-surface p-5">
              <h3 className="font-semibold text-ink">
                <Link
                  href={`/guides/${guide.slug}/`}
                  className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {guide.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{guide.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
