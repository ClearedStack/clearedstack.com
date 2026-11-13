import type { Metadata } from "next";
import Link from "next/link";
import { Flow } from "@/components/Diagram";
import { SectionLabel } from "@/components/SectionLabel";
import { ToolCatalog } from "@/components/ToolCatalog";
import { liveCount, tools } from "@/data/catalog";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "The ClearedStack catalog: free, open-source tools for pricing, proposals, cyber compliance, market research and DevSecOps in government contracting.",
  alternates: { canonical: "/tools/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 hover:text-accent";

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>Catalog</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Tools</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {liveCount === 0
          ? `${tools.length} tools are planned and none are live yet. Each will ship as its own open-source repository and be linked here the day it works.`
          : `${liveCount} of ${tools.length} tools are live. Each one is its own open-source repository.`}{" "}
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

      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        The 18 planned tools below were chosen by the owner before the Prior Art evaluation process was written down.
        Their provenance is not yet recorded and will be back-filled through the same public screening and scoring
        pipeline. Learn{" "}
        <Link href="/how-we-decide/" className={inlineLink}>
          how we decide what to build
        </Link>{" "}
        and how each idea is evaluated.
      </p>

      <div className="mt-8">
        <Flow
          caption="How a tool moves from an approved idea to a live utility."
          direction="across"
          steps={[
            {
              tag: "Stage 6–7",
              label: "Planned",
              detail: "Idea approved by the human owner after passing five knockout gates and rubric scoring; provenance note approved.",
            },
            {
              tag: "Stage 8",
              label: "Building",
              detail: "Clean-room development in its own repository, built from the public regulation without third-party code.",
            },
            {
              tag: "Stage 9",
              label: "Live",
              detail: "Passes all five listing conditions: browser-only, zero network calls, offline, public sources, and permissive license.",
            },
          ]}
        />
      </div>

      <div className="mt-10">
        <ToolCatalog />
      </div>
    </div>
  );
}
