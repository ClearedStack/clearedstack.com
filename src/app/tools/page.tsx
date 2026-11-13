import type { Metadata } from "next";
import Link from "next/link";
import { Flow } from "@/components/Diagram";
import { SectionLabel } from "@/components/SectionLabel";
import { ToolCatalog } from "@/components/ToolCatalog";
import { liveCount, tools } from "@/data/catalog";
import { controlPlaneApps, workerApps } from "@/data/platform";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "The ClearedStack catalog: 18 free browser utilities for pricing, proposals, cyber compliance, market research, and DevSecOps, plus 17 MIT platform and factory tools.",
  alternates: { canonical: "/tools/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 hover:text-accent";

export default function ToolsPage() {
  const totalPlatformTools = controlPlaneApps.length + workerApps.length;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="CLIN 0001–0006">Catalog</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Tools</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {liveCount === 0
          ? `${tools.length} browser contracting utilities and ${totalPlatformTools} platform and factory tools are listed below. Each ships as its own open-source repository.`
          : `${liveCount} of ${tools.length} browser utilities are live alongside ${totalPlatformTools} platform and factory tools.`}{" "}
        New here? Start with{" "}
        <Link href="/guides/navigating-this-site/" className={inlineLink}>
          how to navigate this site
        </Link>
        . Want a tool sooner, or one that is not listed?{" "}
        <a href={`mailto:${site.email}`} className={inlineLink}>
          Say so
        </a>
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

      {/* CLIN 0001 - 0006: Unified Tool Catalog */}
      <div className="mt-10 pb-16">
        <ToolCatalog />
      </div>
    </div>
  );
}
