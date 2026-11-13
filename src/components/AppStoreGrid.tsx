"use client";

import { useMemo, useState } from "react";
import { EditTrigger } from "@/components/EditTrigger";
import { HealthChip } from "@/components/StatusChip";
import type { PlatformApp } from "@/data/platform";
import { site } from "@/data/site";

type FilterKind = "all" | "control-plane" | "worker";

export function AppStoreGrid({
  controlPlane,
  workers,
}: {
  controlPlane: PlatformApp[];
  workers: PlatformApp[];
}) {
  const [filter, setFilter] = useState<FilterKind>("all");
  const [query, setQuery] = useState("");
  const [ownerMode, setOwnerMode] = useState(false);
  const [actionNotice, setActionNotice] = useState<Record<string, string>>({});

  const allApps = useMemo(() => [...controlPlane, ...workers], [controlPlane, workers]);
  const visible = useMemo(() => {
    const byKind = filter === "all" ? allApps : allApps.filter((a) => a.kind === filter);
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) return byKind;
    return byKind.filter((app) => {
      const haystack = `${app.name} ${app.namespace} ${app.role} ${app.ownerRepo} ${app.notes} ${app.subTools.join(" ")}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [allApps, filter, query]);

  function triggerOwnerAction(appId: string, action: string) {
    setActionNotice((prev) => ({
      ...prev,
      [appId]: `${action} queued via cs-store (Server-Side Apply preview)`,
    }));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter apps by namespace">
          {(
            [
              ["all", `All (${allApps.length})`],
              ["control-plane", `Control Plane (${controlPlane.length})`],
              ["worker", `10 Workers (${workers.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
                filter === key
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="block">
            <span className="sr-only">Filter platform apps</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter apps: cs-git, intake, spool…"
              autoComplete="off"
              spellCheck={false}
              className="w-56 rounded-sm border border-line bg-surface px-2.5 py-1.5 font-mono text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none sm:w-64"
            />
          </label>
          <button
            type="button"
            onClick={() => setOwnerMode((v) => !v)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
              ownerMode
                ? "border-accent bg-accent/10 text-accent"
                : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {ownerMode ? "Owner Mode Preview: ON" : "Owner Mode Preview: OFF"}
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-line p-8 text-center text-sm text-muted">
          No platform app or worker matches “{query}”.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((app) => (
            <div key={app.id} id={`app-${app.id}`} className="flex flex-col justify-between rounded-sm border border-line bg-surface p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-ink">{app.name}</span>
                  <HealthChip state={app.health} />
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted">
                  ns: <code className="text-ink">{app.namespace}</code> · {app.version} · {app.ramBudget}
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{app.role}</p>
                {app.subTools.length > 0 ? (
                  <p className="mt-2 font-mono text-xs text-muted">
                    Sub-tools: <span className="text-ink">{app.subTools.join(", ")}</span>
                  </p>
                ) : (
                  <p className="mt-2 font-mono text-xs text-muted">{app.notes}</p>
                )}
              </div>

              <div className="mt-4 border-t border-line pt-3">
                {ownerMode ? (
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                    {(["Upgrade", "Pause", "Rollback"] as const).map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => triggerOwnerAction(app.id, act)}
                        className="rounded-sm border border-line px-2 py-1 text-ink transition-colors hover:border-accent hover:text-accent"
                      >
                        {act}
                      </button>
                    ))}
                    <span className="ml-auto text-[10px] text-muted">5 digests in cs-registry</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <a
                      href={`${site.github}/${app.ownerRepo}`}
                      rel="noopener"
                      className="text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                    >
                      Repo: {app.ownerRepo}
                    </a>
                    <EditTrigger
                      elementId={`${app.kind === "worker" ? "worker" : "app"}.${app.id}.manifest`}
                      ownerRepo={app.ownerRepo}
                      targetLabel={`${app.name} app.yaml`}
                      editClass="CONFIG"
                    />
                  </div>
                )}

                {actionNotice[app.id] ? (
                  <p className="mt-2 font-mono text-[11px] text-accent">{actionNotice[app.id]}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
