"use client";

import { useState } from "react";
import { EditTrigger } from "@/components/EditTrigger";
import { HealthChip } from "@/components/StatusChip";
import type { PlatformApp } from "@/data/platform";

type FilterKind = "all" | "control-plane" | "worker";

export function AppStoreGrid({
  controlPlane,
  workers,
}: {
  controlPlane: PlatformApp[];
  workers: PlatformApp[];
}) {
  const [filter, setFilter] = useState<FilterKind>("all");
  const [ownerMode, setOwnerMode] = useState(false);
  const [actionNotice, setActionNotice] = useState<Record<string, string>>({});

  const allApps = [...controlPlane, ...workers];
  const visible =
    filter === "all"
      ? allApps
      : allApps.filter((a) => a.kind === filter);

  function triggerOwnerAction(appId: string, action: string) {
    setActionNotice((prev) => ({
      ...prev,
      [appId]: `${action} queued via cs-store (Server-Side Apply preview)`,
    }));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter apps by namespace">
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

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((app) => (
          <div key={app.id} className="flex flex-col justify-between rounded-sm border border-line bg-surface p-5">
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
                  <span className="text-muted">Actions: Install · Upgrade · Pause · Rollback</span>
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
    </div>
  );
}
