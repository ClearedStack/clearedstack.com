import type { Metadata } from "next";
import Link from "next/link";
import { EditTrigger } from "@/components/EditTrigger";
import { GuidesSubnav } from "@/components/GuidesSubnav";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip, HealthChip } from "@/components/StatusChip";
import { WhyDrawer } from "@/components/WhyDrawer";

export const metadata: Metadata = {
  title: "Decisions & Public Edits",
  description:
    "cs-04-decide queue and anonymous public edit proposals routed to cs-git and mirrored to GitHub.",
  alternates: { canonical: "/guides/decide/" },
};

export default function DecideGuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 lg:pt-14">
      <GuidesSubnav current="decide" />

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

      <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        Decisions &amp; Public Edit Proposals
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        There is no lock on this site. Every scored candidate waiting for determination and every anonymous{" "}
        <code className="text-ink">✎ Edit</code> proposal from visitors appears here transparently. See the full
        5-gate screening rules and 100-point rubric in{" "}
        <Link
          href="/guides/how-we-decide/"
          className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
        >
          How we decide (Section M)
        </Link>
        .
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-sm border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              Candidate Decisions (cs-04-decide)
            </h2>
            <HealthChip state="idle" label="0 waiting" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Honest empty state: 0 scored candidates are waiting for a determination yet. Once{" "}
            <code className="text-ink">cs-01-intake</code> through <code className="text-ink">cs-03-evaluate</code>{" "}
            run, scored items appear here for Build, Link, Merge, Park, or Reject.
          </p>
        </div>

        <div className="rounded-sm border border-line bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
              Anonymous Edit Proposals (core.edit_proposal)
            </h2>
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
}
