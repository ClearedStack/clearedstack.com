import type { Metadata } from "next";
import Link from "next/link";
import { EditTrigger } from "@/components/EditTrigger";
import { GuidesSubnav } from "@/components/GuidesSubnav";
import { MetricCell } from "@/components/MetricCell";
import { PulseStrip } from "@/components/PulseStrip";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip, HealthChip } from "@/components/StatusChip";
import { TrailRow } from "@/components/TrailRow";
import { WhyDrawer } from "@/components/WhyDrawer";
import { workerApps } from "@/data/platform";

export const metadata: Metadata = {
  title: "10-Worker Pipeline",
  description:
    "Live 100% deterministic pipeline across cs-01-intake through cs-10-notify with per-case sub-tools.",
  alternates: { canonical: "/guides/pipeline/" },
};

export default function PipelineGuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 lg:pt-14">
      <GuidesSubnav current="pipeline" />

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

      <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        The Ten Deterministic Workers
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Every worker lives in its own repository (<code className="text-ink">cs-01-intake</code> through{" "}
        <code className="text-ink">cs-10-notify</code>)—forming the 11-repository pipeline alongside{" "}
        <code className="text-ink">clearedstack.com</code>—and runs in <code className="text-ink">cs-workers</code>.
        Read the full evaluation gates and 14-state lifecycle in{" "}
        <Link href="/guides/how-we-decide/" className="text-accent underline underline-offset-4">
          How we decide (Section M)
        </Link>
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
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
          Item Trail Preview (PA-XXXX)
        </h2>
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
}
