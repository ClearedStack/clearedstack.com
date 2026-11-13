import type { Metadata } from "next";
import Link from "next/link";
import { AppStoreGrid } from "@/components/AppStoreGrid";
import { Flow } from "@/components/Diagram";
import { PulseStrip } from "@/components/PulseStrip";
import { SectionLabel } from "@/components/SectionLabel";
import { DraftChip } from "@/components/StatusChip";
import { ToolCatalog } from "@/components/ToolCatalog";
import { WhyDrawer } from "@/components/WhyDrawer";
import { liveCount, tools } from "@/data/catalog";
import { controlPlaneApps, workerApps } from "@/data/platform";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Tools & Apps",
  description:
    "The ClearedStack catalog: 18 free browser utilities for pricing, proposals, cyber compliance, market research, and DevSecOps, plus all 17 MIT platform microservices and deterministic factory workers.",
  alternates: { canonical: "/tools/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 hover:text-accent";

export default function ToolsPage() {
  const totalPlatformApps = controlPlaneApps.length + workerApps.length;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="CLIN 0001–0006">Tools &amp; Platform Apps</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Tools &amp; Apps</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {liveCount === 0
          ? `${tools.length} browser contracting utilities are planned alongside ${totalPlatformApps} clean-room MIT platform apps and deterministic workers. Each ships as its own open-source repository.`
          : `${liveCount} of ${tools.length} browser utilities are live alongside ${totalPlatformApps} MIT platform apps and workers.`}{" "}
        New here? Start with{" "}
        <Link href="/guides/navigating-this-site/" className={inlineLink}>
          how to navigate this site
        </Link>
        , or jump straight to{" "}
        <a href="#apps" className={inlineLink}>
          Platform &amp; Factory Apps (CLIN 0006)
        </a>
        . Want a tool sooner, or one that is not listed?{" "}
        <a href={`mailto:${site.email}`} className={inlineLink}>
          Say so
        </a>
        .
      </p>

      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Each contracting tool below is verified by <code className="text-ink">cs-07-verify</code> and published by{" "}
        <code className="text-ink">cs-08-catalog</code> from clean-room specifications—100% deterministic with zero AI
        at runtime. Follow live progress under Guides in{" "}
        <Link href="/guides/pipeline/" className={inlineLink}>
          Pipeline
        </Link>
        , review pending items in{" "}
        <Link href="/guides/decide/" className={inlineLink}>
          Decide
        </Link>
        , or read{" "}
        <Link href="/guides/how-we-decide/" className={inlineLink}>
          how we decide what to build
        </Link>
        .
      </p>

      <div className="mt-8">
        <Flow
          caption="How a tool moves through the deterministic worker pipeline into this catalog."
          direction="across"
          steps={[
            {
              tag: "cs-01..05",
              label: "Planned",
              detail: "Idea cleared 5 binary knockout gates and 100-pt rubric, approved by the human owner in cs-04-decide, with clean-room spec stamped by cs-05-provenance.",
            },
            {
              tag: "cs-06",
              label: "Building",
              detail: "Clean-room development in its own MIT repository from the official public regulation without third-party code or observation snapshots.",
            },
            {
              tag: "cs-07..08",
              label: "Live",
              detail: "Verified by cs-07-verify (browser-only, connect-src 'self', offline, worked examples, citations) and published by cs-08-catalog.",
            },
          ]}
        />
      </div>

      {/* CLIN 0001 - 0005: Browser Contracting Utilities */}
      <div className="mt-10">
        <ToolCatalog />
      </div>

      {/* CLIN 0006: All Platform & Factory Apps */}
      <section id="apps" aria-labelledby="apps-title" className="mt-20 border-t-2 border-ink pt-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel section="CLIN 0006">Platform &amp; Factory Apps · cs-store</SectionLabel>
          <div className="flex items-center gap-2">
            <DraftChip />
            <WhyDrawer
              title="Why platform microservices and workers live alongside contracting tools"
              summary="Every piece of software ClearedStack builds—whether a browser calculator or a 30 MiB Go Kubernetes reconciler—is open-source MIT software with one bounded job and zero AI at runtime."
              guideHref="/guides/self-building-factory-loop/"
              details={[
                "7 control-plane apps in the clearedstack namespace (~640 MiB total RAM).",
                "10 deterministic worker apps in cs-workers (~300 MiB total RAM across 10 separate repos).",
                "Zero Docker daemon anywhere: built with ko + rootless BuildKit, reconciled via cs-store.",
              ]}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="apps-title" className="text-2xl font-semibold tracking-[-0.015em] sm:text-3xl">
            Platform &amp; Factory Apps ({totalPlatformApps})
          </h2>
          <Link
            href="/guides/apps/"
            className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4 hover:text-ink"
          >
            Open dedicated Cluster App Store view (/guides/apps) →
          </Link>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          All {controlPlaneApps.length} clean-room control-plane services in{" "}
          <code className="text-ink">clearedstack</code> and all {workerApps.length} deterministic pipeline workers in{" "}
          <code className="text-ink">cs-workers</code>. Toggle <strong>Owner Mode Preview</strong> to inspect how{" "}
          <code className="text-ink">cs-store</code> queues Server-Side Apply upgrades, pauses, and 5-digest rollbacks,
          or click <code className="text-ink">✎ Edit</code> to propose a manifest change.
        </p>

        <div className="mt-6">
          <PulseStrip
            state="healthy"
            summary="17 total pods across 2 namespaces · 0 erroring · 0 stale"
            metrics={[
              { label: "Control plane", value: String(controlPlaneApps.length), unit: "pods (~640 MiB)" },
              { label: "Workers", value: String(workerApps.length), unit: "pods (~300 MiB)" },
              { label: "Rollback depth", value: "5", unit: "digests / app" },
              { label: "Docker daemon", value: "0", unit: "ko + BuildKit" },
            ]}
          />
        </div>

        <div className="mt-8">
          <AppStoreGrid controlPlane={controlPlaneApps} workers={workerApps} />
        </div>
      </section>
    </div>
  );
}
