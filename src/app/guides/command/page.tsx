import type { Metadata } from "next";
import Link from "next/link";
import { AttentionCard } from "@/components/AttentionCard";
import { EditTrigger } from "@/components/EditTrigger";
import { GuidesSubnav } from "@/components/GuidesSubnav";
import { PulseStrip } from "@/components/PulseStrip";
import { SectionLabel } from "@/components/SectionLabel";
import { HealthChip } from "@/components/StatusChip";
import { WhyDrawer } from "@/components/WhyDrawer";
import { liveCount, tools } from "@/data/catalog";
import { attentionRules, controlPlaneApps, workerApps } from "@/data/platform";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Command Portal",
  description:
    "Live Kubernetes-native Command Portal: deterministic P0–P2 attention rules, 10-worker pulse, 7 control-plane microservices, and public edit proposals with no login lock.",
  alternates: { canonical: "/guides/command/" },
};

export default function CommandPortalPage() {
  const activeErrors = [...controlPlaneApps, ...workerApps].filter((a) => a.health === "erroring");
  const totalQueued = workerApps.reduce((sum, w) => sum + w.queued, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 lg:pt-14">
      <GuidesSubnav current="command" />

      {/* Live Pulse Strip */}
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

      {/* Hero / Command Header */}
      <section className="mt-10 border-b border-line pb-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel section="Command">Open Public Sandbox · No Login Lock</SectionLabel>
          <div className="flex items-center gap-2">
            <WhyDrawer
              title="Why a live command portal instead of static essays?"
              summary="Folks are done reading. Software rules—not AI—promote errors, stalled queues, and pending decisions to the top so anyone can see what is actually running."
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

        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-5xl">
          Software decides what’s on screen. Everything is public.
        </h1>
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
            href="/guides/apps/"
            className="rounded-sm bg-accent px-4 py-2 font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Cluster App Store (/guides/apps) -&gt;
          </Link>
          <Link
            href="/guides/pipeline/"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            10-Worker Pipeline (/guides/pipeline)
          </Link>
          <Link
            href="/guides/decide/"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            Decisions &amp; Public Edits (/guides/decide)
          </Link>
          <Link
            href="/tools/"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            All Tools &amp; Apps ({liveCount}/{tools.length} tools + 17 apps)
          </Link>
        </div>
      </section>

      {/* Promoted by Software Rules (P0 - P2) */}
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
              "Owner Mode in /guides/apps/ provides 1-click Pause and Rollback across the last 5 digests.",
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
              "Nothing touches cs-git or the cluster until the human owner clicks Approve in /guides/decide/.",
              "Approved edits route directly to the owning repo defined in ownership_map.json.",
            ]}
          />
        </div>
      </section>

      {/* 10-Worker Pulse Strip */}
      <section className="mt-14 border-t border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <SectionLabel>cs-workers namespace</SectionLabel>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.015em]">
              Ten deterministic workers
            </h2>
          </div>
          <Link
            href="/guides/pipeline/"
            className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4"
          >
            Inspect full pipeline -&gt;
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {workerApps.map((w) => (
            <div
              key={w.id}
              className="flex flex-col justify-between rounded-sm border border-line bg-surface p-3.5"
            >
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

      {/* Control Plane Strip */}
      <section className="mt-14 border-t border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <SectionLabel>clearedstack namespace · ~640 MiB control plane</SectionLabel>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.015em]">
              Seven clean-room MIT microservices
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/tools/#apps"
              className="font-mono text-xs uppercase tracking-wider text-muted underline underline-offset-4 hover:text-ink"
            >
              Browse in Tools (/tools/#apps)
            </Link>
            <Link
              href="/guides/apps/"
              className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4"
            >
              Open Cluster App Store -&gt;
            </Link>
          </div>
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
}
