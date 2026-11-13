import type { Metadata } from "next";
import Link from "next/link";
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
      <SectionLabel>Catalog</SectionLabel>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Tools</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {liveCount === 0
          ? `${tools.length} tools are planned and none are live yet. Each will ship as its own open-source repository and be linked here the day it works.`
          : `${liveCount} of ${tools.length} tools are live. Each one is its own open-source repository.`}{" "}
        New here? Start with the{" "}
        <Link href="/guides/getting-started/" className={inlineLink}>
          getting started guide
        </Link>
        . Want a tool sooner, or one that is not listed?{" "}
        <a href={`mailto:${site.email}`} className={inlineLink}>
          Say so
        </a>
        .
      </p>
      <div className="mt-10">
        <ToolCatalog />
      </div>
    </div>
  );
}
