import Link from "next/link";
import { EditTrigger } from "@/components/EditTrigger";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip, HealthChip } from "@/components/StatusChip";
import { WhyDrawer } from "@/components/WhyDrawer";
import { liveCount, tools } from "@/data/catalog";
import { attentionRules, controlPlaneApps, workerApps } from "@/data/platform";
import { site } from "@/data/site";

export default function CommandPortalHome() {
  const activeErrors = [...controlPlaneApps, ...workerApps].filter((a) => a.health === "erroring");
  const totalQueued = workerApps.reduce((sum, w) => sum + w.queued, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 lg:pt-14">
      {/* Live Pulse Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface px-4 py-2.5 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <HealthChip state="idle" label="Draft · Architecture Preview" />
          <span className="text-muted">
            2 namespaces (<code className="text-ink">clearedstack</code> +{" "}
            <code className="text-ink">cs-workers</code>) · 7 control-plane pods · 10 deterministic workers
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted">
          <span>0 records collected yet</span>
          <span>·</span>
          <span>Revised {site.revised}</span>
        </div>
      </div>

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
          ClearedStack is a lightweight, Docker-free Kubernetes platform and free GovCon tool arsenal. Seven tiny Go
          microservices (<code className="text-ink">cs-git</code>, <code className="text-ink">cs-registry</code>,{" "}
          <code className="text-ink">cs-runner</code>, <code className="text-ink">cs-store</code>, Postgres,{" "}
          <code className="text-ink">hub-queue-api</code>, and this Portal) run alongside ten deterministic workers (
          <code className="text-ink">cs-01</code>–<code className="text-ink">cs-10</code>). No login wall, no hidden
          status, zero AI at runtime.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs">
          <Link
            href="/apps/"
            className="rounded-sm bg-accent px-4 py-2 font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Open App Store (/apps) -&gt;
          </Link>
          <Link
            href="/pipeline/"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            10-Worker Pipeline (/pipeline)
          </Link>
          <Link
            href="/decide/"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            Decisions &amp; Public Edits (/decide)
          </Link>
          <Link
            href="/tools/"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-ink transition-colors hover:border-ink"
          >
            Tools Catalog ({liveCount}/{tools.length} live)
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

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-line border-t-2 border-t-ink bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">P0 · Active Errors</span>
              <HealthChip state={activeErrors.length > 0 ? "erroring" : "healthy"} label={`${activeErrors.length} errors`} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Sanitized error codes (<code className="text-ink">E_TIMEOUT</code>, <code className="text-ink">E_PARSE</code>,{" "}
              <code className="text-ink">E_NEEDS_SUBTOOL</code>) float here automatically when any pod fails. Internal IPs
              and node names are stripped by <code className="text-ink">cs-store</code>.
            </p>
          </div>

          <div className="rounded-sm border border-line border-t-2 border-t-ink bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">P1 · Queue &amp; Sub-Tools</span>
              <HealthChip state="idle" label={`${totalQueued} queued`} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Honest empty state: 0 records collected yet. When a worker hits an unknown layout, it pauses in{" "}
              <code className="text-ink">needs_subtool</code> until a deterministic sub-tool and golden fixture are added.
            </p>
          </div>

          <div className="rounded-sm border border-line border-t-2 border-t-ink bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">P2 · Decisions &amp; Edits</span>
              <DraftChip />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Anyone can click <code className="text-ink">✎ Edit</code> on any element without signing in. Proposals wait
              in <code className="text-ink">cs-04-decide</code>, route to <code className="text-ink">cs-git</code>, build
              without Docker, and mirror to GitHub.
            </p>
          </div>
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
          <Link href="/pipeline/" className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4">
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
          <Link href="/apps/" className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4">
            Open App Store (/apps) -&gt;
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
}
