"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DocStatusChip } from "@/components/StatusChip";
import type { Doc, DocGroup } from "@/lib/docs";

/** What the list needs from each page. Kept small because it is sent to the browser. */
export type DocIndexEntry = Pick<Doc, "slug" | "href" | "code" | "title" | "summary" | "group" | "minutes" | "status"> & {
  topics: string[];
};

function matches(entry: DocIndexEntry, groupName: string, query: string) {
  const haystack = `${entry.code} ${entry.title} ${entry.summary} ${entry.topics.join(" ")} ${groupName}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/** The filterable list of pages on /guides/ and /platform/. */
export function DocIndex({
  groups,
  docs,
  noun = "guide",
  placeholder,
}: {
  groups: readonly DocGroup[];
  docs: DocIndexEntry[];
  /** What one entry is called: "guide" or "page". */
  noun?: string;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  const sections = useMemo(
    () =>
      groups
        .filter((group) => activeGroup === "all" || group.id === activeGroup)
        .map((group) => ({
          group,
          docs: docs.filter((doc) => doc.group === group.id && matches(doc, group.name, query)),
        })),
    [groups, docs, activeGroup, query],
  );
  const shown = sections.reduce((total, section) => total + section.docs.length, 0);
  const tab = (selected: boolean) =>
    `rounded-sm border px-2.5 py-1.5 font-mono text-xs transition-colors ${
      selected ? "border-ink bg-ink text-paper" : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:max-w-md">
          <label className="block w-full">
            <span className="sr-only">Filter {noun}s</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
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
          Showing {shown} of {docs.length} {noun}s
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={activeGroup === "all"}
          onClick={() => setActiveGroup("all")}
          className={tab(activeGroup === "all")}
        >
          All sections <span className={activeGroup === "all" ? "text-paper/75" : "text-accent"}>{docs.length}</span>
        </button>
        {groups.map((group) => {
          const count = docs.filter((doc) => doc.group === group.id).length;
          const selected = activeGroup === group.id;
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveGroup(selected ? "all" : group.id)}
              className={tab(selected)}
            >
              {group.code} {group.name} <span className={selected ? "text-paper/75" : "text-accent"}>{count}</span>
            </button>
          );
        })}
      </div>

      {shown === 0 ? (
        <p className="mt-12 rounded-sm border border-dashed border-line p-8 text-center text-muted">
          Nothing matches “{query}”. If a {noun} should exist, ask for it on GitHub or by email.
        </p>
      ) : null}

      {sections.map(({ group, docs: list }) =>
        list.length === 0 ? null : (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className="mt-14 grid scroll-mt-6 gap-x-16 gap-y-6 lg:grid-cols-[15rem_minmax(0,1fr)]"
          >
            <div className="lg:sticky lg:top-6 lg:self-start">
              <p className="font-mono text-xs text-accent">{group.code}</p>
              <h2 id={`${group.id}-title`} className="mt-1 text-2xl font-semibold tracking-[-0.015em]">
                {group.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{group.blurb}</p>
              <p className="mt-3 font-mono text-xs text-muted">
                {list.length} {list.length === 1 ? noun : `${noun}s`} ·{" "}
                {list.reduce((total, doc) => total + doc.minutes, 0)} min
              </p>
            </div>

            <ol className="border-t-2 border-ink">
              {list.map((doc) => (
                <li key={doc.slug} className="border-b border-line">
                  <Link
                    href={doc.href}
                    className="group grid gap-x-5 gap-y-1.5 py-5 sm:grid-cols-[4rem_minmax(0,1fr)_auto]"
                  >
                    <span className="pt-1 font-mono text-xs text-accent">{doc.code}</span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
                          {doc.title}
                        </span>
                        {doc.status ? <DocStatusChip status={doc.status} /> : null}
                      </span>
                      <span className="mt-1.5 block text-[15px] leading-relaxed text-muted">{doc.summary}</span>
                      {/* The headings are a lot to scroll past on a phone; the filter still searches them. */}
                      {doc.topics.length > 0 ? (
                        <span className="mt-3 hidden flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] leading-relaxed text-muted sm:flex">
                          {doc.topics.map((topic, index) => (
                            <span key={topic}>
                              {topic}
                              {index < doc.topics.length - 1 ? <span className="ml-2 text-line">/</span> : null}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                    <span className="pt-1 font-mono text-xs whitespace-nowrap text-muted sm:text-right">
                      {doc.minutes} min
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
