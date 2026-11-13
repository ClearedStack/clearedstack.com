"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusChip } from "@/components/StatusChip";
import { categories, tools, type Tool } from "@/data/catalog";
import { controlPlaneApps, workerApps } from "@/data/platform";
import { site } from "@/data/site";

type CatalogGroup = {
  id: string;
  clin: string;
  name: string;
  blurb: string;
  tools: (Tool & { detailNote?: string })[];
};

const platformTools: (Tool & { detailNote?: string })[] = [...controlPlaneApps, ...workerApps].map((app) => ({
  slug: app.id,
  name: app.name,
  summary: app.role,
  category: "devsecops", // unused for grouping here
  status: app.health === "healthy" ? "building" : "planned",
  url: `/guides/spec-${app.id}/`,
  repo: `${site.github}/${app.ownerRepo}`,
  detailNote: [
    `ns: ${app.namespace}`,
    app.version,
    app.ramBudget,
    app.subTools.length > 0 ? `Sub-tools: ${app.subTools.join(", ")}` : app.notes,
  ].join(" · "),
}));

const allGroups: CatalogGroup[] = [
  ...categories.map((category) => ({
    id: category.id,
    clin: category.clin,
    name: category.name,
    blurb: category.blurb,
    tools: tools.filter((tool) => tool.category === category.id),
  })),
  {
    id: "apps",
    clin: "0006",
    name: "Platform & factory tools",
    blurb: "Clean-room MIT microservices and deterministic workers that run the factory.",
    tools: platformTools,
  },
];

const totalToolsCount = tools.length + platformTools.length;

function matches(tool: Tool & { detailNote?: string }, categoryName: string, query: string) {
  const haystack = `${tool.name} ${tool.summary} ${tool.detailNote ?? ""} ${categoryName}`.toLowerCase();
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
      allGroups.map((category) => ({
        category,
        tools: category.tools.filter((tool) => matches(tool, category.name, query)),
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
            placeholder="Filter: wrap rate, CUI, NAICS, cs-git…"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-sm border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </label>
        <p className="font-mono text-xs text-muted" aria-live="polite">
          {shown} of {totalToolsCount} tools
        </p>
      </div>

      <nav aria-label="Categories" className="mt-5 flex flex-wrap gap-2">
        {allGroups.map((category) => (
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
          <section key={category.id} id={category.id} aria-labelledby={`${category.id}-title`} className="mt-12">
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
                    {tool.url ? (
                      <a href={tool.url} className="underline decoration-accent underline-offset-4 hover:text-accent">
                        {tool.name}
                      </a>
                    ) : (
                      tool.name
                    )}
                  </h3>
                  <div>
                    <p className="text-sm leading-relaxed text-muted">{tool.summary}</p>
                    <p className="mt-1.5 font-mono text-xs text-muted">
                      {tool.detailNote ? (
                        <span>{tool.detailNote}</span>
                      ) : tool.provenance?.inspiredBy && tool.provenance.inspiredBy.length > 0 ? (
                        <span>
                          <span className="text-muted">Where the idea came from: </span>
                          {tool.provenance.inspiredBy.map((item, idx) => (
                            <span key={item.name}>
                              {idx > 0 ? ", " : ""}
                              {item.url ? (
                                <a
                                  href={item.url}
                                  rel="noopener"
                                  className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
                                >
                                  {item.name}
                                </a>
                              ) : (
                                <span className="text-ink">{item.name}</span>
                              )}
                            </span>
                          ))}
                          {tool.provenance.note ? <span> — {tool.provenance.note}</span> : null}
                        </span>
                      ) : (
                        <span>
                          Provenance: not yet recorded ·{" "}
                          <Link
                            href="/guides/prior-art-engine/"
                            className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                          >
                            Prior Art process
                          </Link>
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="flex items-center gap-3">
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
