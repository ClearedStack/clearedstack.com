"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusChip } from "@/components/StatusChip";
import { categories, tools, type Tool } from "@/data/catalog";

function matches(tool: Tool, categoryName: string, query: string) {
  const haystack = `${tool.name} ${tool.summary} ${tool.detail ?? ""} ${categoryName}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function ToolCatalog() {
  const [query, setQuery] = useState("");

  const groups = useMemo(
    () =>
      categories.map((category) => ({
        category,
        tools: tools.filter((tool) => tool.category === category.id && matches(tool, category.name, query)),
      })),
    [query],
  );
  const shown = groups.reduce((total, group) => total + group.tools.length, 0);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full sm:max-w-sm">
          <span className="sr-only">Filter tools</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter: wrap rate, CUI, NAICS…"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-sm border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </label>
        <p className="font-mono text-xs text-muted" aria-live="polite">
          {shown} of {tools.length} tools
        </p>
      </div>

      <nav aria-label="Categories" className="mt-5 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="rounded-sm border border-line px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:border-ink hover:text-ink"
          >
            {category.clin} {category.name}
          </a>
        ))}
      </nav>

      {shown === 0 ? (
        <p className="mt-12 rounded-sm border border-dashed border-line p-8 text-center text-muted">
          Nothing matches “{query}”. If it should exist, suggest it on GitHub or by email.
        </p>
      ) : null}

      {groups.map(({ category, tools: list }) =>
        list.length === 0 ? null : (
          <section
            key={category.id}
            id={category.id}
            aria-labelledby={`${category.id}-title`}
            className="mt-12 scroll-mt-6"
          >
            <div className="flex flex-col gap-1 border-b-2 border-ink pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <h2 id={`${category.id}-title`} className="text-xl font-semibold">
                <span className="mr-3 font-mono text-xs font-normal text-accent">CLIN {category.clin}</span>
                {category.name}
              </h2>
              <p className="text-sm text-muted">{category.blurb}</p>
            </div>
            <ul>
              {list.map((tool) => (
                <li
                  key={tool.slug}
                  className="grid gap-x-6 gap-y-1.5 border-b border-line py-4 sm:grid-cols-[minmax(0,17rem)_1fr_auto] sm:items-baseline"
                >
                  <h3 className="font-medium">
                    <Link
                      href={`/tools/${tool.slug}/`}
                      className="underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
                    >
                      {tool.name}
                    </Link>
                  </h3>
                  <div>
                    <p className="text-sm leading-relaxed text-muted">{tool.summary}</p>
                    {tool.sources && tool.sources.length > 0 ? (
                      <p className="mt-1.5 font-mono text-xs leading-relaxed text-muted">
                        Built from: {tool.sources[0].name}
                        {tool.sources.length > 1 ? `, and ${tool.sources.length - 1} more` : ""}
                      </p>
                    ) : null}
                  </div>
                  <p className="flex items-center gap-3">
                    {tool.url ? (
                      <a
                        href={tool.url}
                        className="font-mono text-xs text-ink underline decoration-accent underline-offset-4 hover:text-accent"
                      >
                        Open
                      </a>
                    ) : null}
                    {tool.repo ? (
                      <a
                        href={tool.repo}
                        rel="noopener"
                        className="font-mono text-xs text-muted underline underline-offset-4 hover:text-ink"
                      >
                        Source
                      </a>
                    ) : null}
                    <StatusChip status={tool.status} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
