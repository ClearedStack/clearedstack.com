"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DraftChip } from "@/components/StatusChip";
import type { Guide, GuideGroup, GuideGroupId } from "@/lib/guides";

/** What the list needs from each guide. Kept small because it is sent to the browser. */
export type GuideIndexEntry = Pick<Guide, "slug" | "code" | "title" | "summary" | "group" | "minutes"> & {
  topics: string[];
  draft?: boolean;
};

function matches(entry: GuideIndexEntry, groupName: string, query: string) {
  const haystack = `${entry.code} ${entry.title} ${entry.summary} ${entry.topics.join(" ")} ${groupName}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function GuideIndex({ groups, guides }: { groups: readonly GuideGroup[]; guides: GuideIndexEntry[] }) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<"all" | GuideGroupId>("all");

  const sections = useMemo(
    () =>
      groups
        .filter((group) => activeGroup === "all" || group.id === activeGroup)
        .map((group) => ({
          group,
          total: guides.filter((guide) => guide.group === group.id).length,
          guides: guides.filter((guide) => guide.group === group.id && matches(guide, group.name, query)),
        })),
    [groups, guides, activeGroup, query],
  );
  const shown = sections.reduce((total, section) => total + section.guides.length, 0);

  return (
    <div>
      {/* Search + Active Count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:max-w-md">
          <label className="block w-full">
            <span className="sr-only">Filter guides</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter: wrap rate, CUI, k3s, cs-store, rubric…"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-sm border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </label>
          {(query !== "" || activeGroup !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveGroup("all");
              }}
              className="shrink-0 rounded-sm border border-line bg-surface px-2.5 py-2.5 font-mono text-xs text-muted transition-colors hover:border-ink hover:text-ink"
            >
              Reset
            </button>
          )}
        </div>
        <p className="font-mono text-xs text-muted" aria-live="polite">
          Showing {shown} of {guides.length} guides
        </p>
      </div>

      {/* Section Filter Tabs */}
      <div role="tablist" aria-label="Filter guides by section" className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={activeGroup === "all"}
          onClick={() => setActiveGroup("all")}
          className={`rounded-sm border px-2.5 py-1.5 font-mono text-xs transition-colors ${
            activeGroup === "all"
              ? "border-ink bg-ink text-paper"
              : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
          }`}
        >
          All sections <span className={activeGroup === "all" ? "text-paper/75" : "text-accent"}>{guides.length}</span>
        </button>
        {groups.map((group) => {
          const count = guides.filter((g) => g.group === group.id).length;
          const selected = activeGroup === group.id;
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveGroup(selected ? "all" : group.id)}
              className={`rounded-sm border px-2.5 py-1.5 font-mono text-xs transition-colors ${
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {group.code} {group.name}{" "}
              <span className={selected ? "text-paper/75" : "text-accent"}>{count}</span>
            </button>
          );
        })}
      </div>

      {shown === 0 ? (
        <p className="mt-12 rounded-sm border border-dashed border-line p-8 text-center text-muted">
          No guide matches “{query}”. If one should exist, ask for it on GitHub or by email.
        </p>
      ) : null}

      {sections.map(({ group, guides: list }) =>
        list.length === 0 ? null : (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className="mt-14 grid gap-x-16 gap-y-6 lg:grid-cols-[15rem_minmax(0,1fr)]"
          >
            <div className="lg:sticky lg:top-6 lg:self-start">
              <p className="font-mono text-xs text-accent">{group.code}</p>
              <h2 id={`${group.id}-title`} className="mt-1 text-2xl font-semibold tracking-[-0.015em]">
                {group.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{group.blurb}</p>
              <p className="mt-3 font-mono text-xs text-muted">
                {list.length} {list.length === 1 ? "guide" : "guides"} ·{" "}
                {list.reduce((total, guide) => total + guide.minutes, 0)} min
              </p>
            </div>

            <ol className="border-t-2 border-ink">
              {list.map((guide) => (
                <li key={guide.slug} className="border-b border-line">
                  <Link
                    href={`/guides/${guide.slug}/`}
                    className="group grid gap-x-5 gap-y-1.5 py-5 sm:grid-cols-[4rem_minmax(0,1fr)_auto]"
                  >
                    <span className="pt-1 font-mono text-xs text-accent">{guide.code}</span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
                          {guide.title}
                        </span>
                        {guide.draft ? <DraftChip /> : null}
                      </span>
                      <span className="mt-1.5 block text-[15px] leading-relaxed text-muted">{guide.summary}</span>
                      {guide.topics.length > 0 ? (
                        <span className="mt-3 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] leading-relaxed text-muted">
                          {guide.topics.map((topic, index) => (
                            <span key={topic}>
                              {topic}
                              {index < guide.topics.length - 1 ? <span className="ml-2 text-line">/</span> : null}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                    <span className="pt-1 font-mono text-xs whitespace-nowrap text-muted sm:text-right">
                      {guide.minutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ),
      )}
    </div>
  );
}
