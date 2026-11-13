import type { Metadata } from "next";
import Link from "next/link";
import { AppStoreGrid } from "@/components/AppStoreGrid";
import { GuidesSubnav } from "@/components/GuidesSubnav";
import { PulseStrip } from "@/components/PulseStrip";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip } from "@/components/StatusChip";
import { WhyDrawer } from "@/components/WhyDrawer";
import { controlPlaneApps, workerApps } from "@/data/platform";

export const metadata: Metadata = {
  title: "Apps & Cluster App Store",
  description:
    "Live App Store view of all 7 control-plane microservices and 10 deterministic workers managed by cs-store.",
  alternates: { canonical: "/guides/apps/" },
};

export default function AppsGuidePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 lg:pt-14">
      <GuidesSubnav current="apps" />

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
        worker in <code className="text-ink">cs-workers</code> is shown publicly with no login lock. All 17 platform
        apps are also listed alongside our 18 browser contracting utilities under{" "}
        <Link href="/tools/#apps" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          Tools &amp; Apps (/tools/#apps)
        </Link>
        .
      </p>

      <div className="mt-6">
        <PulseStrip
          state="healthy"
          summary="17 total pods across 2 namespaces · 0 erroring · 0 stale"
          metrics={[
            { label: "Control plane", value: "7", unit: "pods (~640 MiB)" },
            { label: "Workers", value: "10", unit: "pods (~300 MiB)" },
            { label: "Rollback depth", value: "5", unit: "digests / app" },
            { label: "Docker daemon", value: "0", unit: "ko + BuildKit" },
          ]}
        />
      </div>

      <div className="mt-8">
        <AppStoreGrid controlPlane={controlPlaneApps} workers={workerApps} />
      </div>
    </div>
  );
}
