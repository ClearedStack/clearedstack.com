import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel";
import { listGuides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "How to use ClearedStack: finding a tool, what happens to your data, checking a result, requesting a tool and hosting your own copy.",
  alternates: { canonical: "/guides/" },
};

export default async function GuidesPage() {
  const guides = await listGuides();
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <SectionLabel>Guides</SectionLabel>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">How to use ClearedStack</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        Short, practical guides to the site and its tools. Start at the top if you are new.
      </p>
      <ol className="mt-10 border-t-2 border-ink">
        {guides.map((guide, index) => (
          <li key={guide.slug} className="border-b border-line">
            <Link
              href={`/guides/${guide.slug}/`}
              className="group grid gap-x-6 gap-y-1 py-5 sm:grid-cols-[3rem_minmax(0,20rem)_1fr] sm:items-baseline"
            >
              <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-lg font-semibold transition-colors group-hover:text-accent">{guide.title}</span>
              <span className="text-sm leading-relaxed text-muted">{guide.summary}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
