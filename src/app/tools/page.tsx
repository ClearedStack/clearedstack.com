import type { Metadata } from "next";
import Link from "next/link";
import { Flow } from "@/components/Diagram";
import { SectionLabel } from "@/components/SectionLabel";
import { ToolCatalog } from "@/components/ToolCatalog";
import { categories, liveCount, tools } from "@/data/catalog";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Tools",
  description: `The ClearedStack catalog: ${tools.length} free browser tools for pricing, proposals, cyber compliance, market research and disconnected networks, each with the regulation it is built from.`,
  alternates: { canonical: "/tools/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 hover:text-accent";

export default function ToolsPage() {
  const first = categories[0].clin;
  const last = categories[categories.length - 1].clin;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section={`CLIN ${first}–${last}`}>Catalog</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Tools</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        {liveCount === 0
          ? `${tools.length} tools are planned and none is live yet.`
          : `${liveCount} of ${tools.length} tools ${liveCount === 1 ? "is" : "are"} live.`}{" "}
        Each has a page that says what it will do and which regulation it is built from. Until a tool ships, the{" "}
        <Link href="/guides/" className={inlineLink}>
          guides
        </Link>{" "}
        cover the same ground by hand. Want one sooner, or one that is not listed?{" "}
        <Link href="/guides/request-or-add-a-tool/" className={inlineLink}>
          Ask for it
        </Link>
        .
      </p>

      <div className="mt-8">
        <Flow
          caption="The three status labels a tool can carry."
          direction="across"
          steps={[
            {
              tag: "Status 1",
              label: "Planned",
              detail: "The job and the public source are written down. No code yet. Requests decide what is built first.",
            },
            {
              tag: "Status 2",
              label: "In development",
              detail: "Being built in its own open-source repository, from the regulation and nothing else.",
            },
            {
              tag: "Status 3",
              label: "Live",
              detail: "It works in the browser, offline, with its sources cited. The name links to the tool.",
            },
          ]}
        />
      </div>

      <div className="mt-10 pb-16">
        <ToolCatalog />
      </div>
    </div>
  );
}
