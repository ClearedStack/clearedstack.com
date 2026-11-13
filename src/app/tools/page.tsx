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
  title: "Tools",
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
        <SectionLabel section="CLIN 0001–0006">Tools &amp; Cluster App Store</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Tools</h1>
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
          Running Apps &amp; Workers (CLIN 0006)
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
        at runtime. Inspect the live{" "}
        <Link href="/guides/#command" className={inlineLink}>
          Command Portal
        </Link>
        ,{" "}
        <Link href="/guides/#pipeline" className={inlineLink}>
          10-Worker Pipeline
        </Link>
        ,{" "}
        <Link href="/guides/#decide" className={inlineLink}>
          Decide Queue
        </Link>
        , and{" "}
        <Link href="/guides/#how-we-decide" className={inlineLink}>
          Section M evaluation factors
        </Link>{" "}
        on the Guides page.
      </p>

      <div className="mt-8">
        <Flow
          caption="How a tool moves through the deterministic worker pipeline into this catalog."
          direction="across"
          steps={[
            {
              tag: "cs-01..05",
              label: "Planned",
              detail:
                "Idea cleared 5 binary knockout gates and 100-pt rubric, approved by the human owner in cs-04-decide, with clean-room spec stamped by cs-05-provenance.",
            },
            {
              tag: "cs-06",
              label: "Building",
              detail:
                "Clean-room development in its own MIT repository from the official public regulation without third-party code or observation snapshots.",
            },
            {
              tag: "cs-07..08",
              label: "Live",
              detail:
                "Verified by cs-07-verify (browser-only, connect-src 'self', offline, worked examples, citations) and published by cs-08-catalog.",
            },
          ]}
        />
      </div>

      {/* CLIN 0001 - 0005: Browser Contracting Utilities */}
      <div className="mt-10">
        <ToolCatalog />
      </div>

      {/* CLIN 0006: Integrated Cluster App Store (Running Apps & Workers) */}
      <section id="apps" aria-labelledby="apps-title" className="mt-20 scroll-mt-10 border-t-2 border-ink pt-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel section="CLIN 0006 · App Store">cs-store · Server-Side Apply</SectionLabel>
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
                "7 control-plane apps in clearedstack (~640 MiB RAM) + 10 worker apps in cs-workers (~300 MiB RAM).",
              ]}
            />
          </div>
        </div>

        <h2 id="apps-title" className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Running Apps &amp; Workers ({totalPlatformApps})
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Every control-plane microservice in <code className="text-ink">clearedstack</code> and every deterministic
          worker in <code className="text-ink">cs-workers</code> is shown publicly here with no login lock. Toggle{" "}
          <strong>Owner Mode Preview</strong> to inspect how <code className="text-ink">cs-store</code> queues
          Server-Side Apply upgrades, pauses, and 5-digest rollbacks, or click{" "}
          <code className="text-ink">✎ Edit</code> to propose a manifest change.
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
