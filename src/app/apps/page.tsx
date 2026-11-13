import { EditTrigger } from "@/components/EditTrigger";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip, HealthChip } from "@/components/StatusChip";
import { WhyDrawer } from "@/components/WhyDrawer";
import { controlPlaneApps, workerApps } from "@/data/platform";

export const metadata = {
  title: "Apps & Cluster App Store",
  description:
    "Live App Store view of all 7 control-plane microservices and 10 deterministic workers managed by cs-store.",
};

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-12 lg:pt-16">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="App Store">cs-store · Server-Side Apply</SectionLabel>
        <div className="flex items-center gap-2">
          <DraftChip />
          <WhyDrawer
            title="How the App Store works without Argo CD or CasaOS"
            summary="cs-store is a 48 MiB clean-room Go reconciler. It reads app.yaml from cs-git, applies native Kubernetes resources, and streams sanitized health back here."
            guideHref="/guides/cs-runner-and-cs-store/"
            details={[
              "Zero custom CRDs and zero Docker daemon anywhere on the cluster.",
              "cs-registry keeps the last 5 signed image digests per app for instant 1-click rollback.",
              "All internal IPs and node names are stripped before reaching the public Portal.",
            ]}
          />
        </div>
      </div>

      <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        Running Apps &amp; Workers
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Every control-plane microservice in <code className="text-ink">clearedstack</code> and every deterministic
        worker in <code className="text-ink">cs-workers</code> is shown publicly with no login lock.
      </p>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
          Control Plane · namespace: clearedstack (~640 MiB total)
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {controlPlaneApps.map((app) => (
            <div key={app.id} className="flex flex-col justify-between rounded-sm border border-line bg-surface p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-ink">{app.name}</span>
                  <HealthChip state={app.health} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{app.role}</p>
                <p className="mt-2 font-mono text-xs text-muted">
                  {app.version} · {app.ramBudget} RAM · {app.notes}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[11px]">
                <span className="text-muted">Actions: Install · Upgrade · Pause · Rollback</span>
                <EditTrigger
                  elementId={`app.${app.id}.manifest`}
                  ownerRepo={app.ownerRepo}
                  targetLabel={`${app.name} app.yaml`}
                  editClass="CONFIG"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
          10 Deterministic Workers · namespace: cs-workers (~300 MiB total)
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {workerApps.map((w) => (
            <div key={w.id} className="flex flex-col justify-between rounded-sm border border-line bg-surface p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-ink">{w.name}</span>
                  <HealthChip state={w.health} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{w.role}</p>
                {w.subTools.length > 0 && (
                  <p className="mt-2 font-mono text-xs text-muted">
                    Sub-tools: <span className="text-ink">{w.subTools.join(", ")}</span>
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[11px]">
                <span className="text-muted">{w.queued} queued · {w.ramBudget}</span>
                <EditTrigger
                  elementId={`worker.${w.id}.manifest`}
                  ownerRepo={w.ownerRepo}
                  targetLabel={`${w.name} config`}
                  editClass="CONFIG"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
