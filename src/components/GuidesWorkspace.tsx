"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

export type GuidesViewId = "manual" | "command" | "pipeline" | "decide" | "how-we-decide" | "all";

interface GuidesWorkspaceProps {
  guideCount: number;
  manualView: ReactNode;
  commandView: ReactNode;
  pipelineView: ReactNode;
  decideView: ReactNode;
  howWeDecideView: ReactNode;
}

function viewFromHash(rawHash: string): GuidesViewId {
  const hash = rawHash.replace(/^#/, "").trim();
  if (hash === "command") return "command";
  if (hash === "pipeline") return "pipeline";
  if (hash === "decide") return "decide";
  if (hash === "how-we-decide") return "how-we-decide";
  if (hash === "all") return "all";
  return "manual";
}

export function GuidesWorkspace({
  guideCount,
  manualView,
  commandView,
  pipelineView,
  decideView,
  howWeDecideView,
}: GuidesWorkspaceProps) {
  const [active, setActive] = useState<GuidesViewId>(() => {
    if (typeof window === "undefined") return "manual";
    return viewFromHash(window.location.hash);
  });

  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash;
      const hash = raw.replace(/^#/, "").trim();
      const next = viewFromHash(raw);
      setActive(next);

      if (hash && !["manual", "command", "pipeline", "decide", "how-we-decide", "all"].includes(hash)) {
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      } else if (hash && hash !== "manual") {
        requestAnimationFrame(() => {
          document.getElementById("guides-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const selectView = (id: GuidesViewId) => {
    setActive(id);
    if (typeof window !== "undefined") {
      const nextHash = id === "manual" ? window.location.pathname : `#${id}`;
      window.history.replaceState(null, "", nextHash);
    }
  };

  const tabs: { id: GuidesViewId; code: string; label: string }[] = [
    { id: "manual", code: "L.1–L.6", label: `Field Manual (${guideCount})` },
    { id: "command", code: "Command", label: "Command Portal" },
    { id: "pipeline", code: "Pipeline", label: "10-Worker Pipeline" },
    { id: "decide", code: "Decide", label: "Decide & Edits" },
    { id: "how-we-decide", code: "Section M", label: "How We Decide" },
    { id: "all", code: "Full", label: "Show All" },
  ];

  return (
    <div id="guides-workspace" className="mt-10 scroll-mt-6">
      {/* Integrated Section Switcher inside the Guides page */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface p-2">
        <div role="tablist" aria-label="Guides and integrated factory sections" className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const isSelected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => selectView(tab.id)}
                className={`rounded-sm px-3 py-2 text-left font-mono text-xs transition-colors ${
                  isSelected
                    ? "bg-ink font-medium text-paper"
                    : "bg-paper text-muted hover:text-ink"
                }`}
              >
                <span className={isSelected ? "text-paper/75" : "text-accent"}>{tab.code}</span> · {tab.label}
              </button>
            );
          })}
        </div>

        <Link
          href="/tools/#apps"
          className="px-2.5 py-1.5 font-mono text-xs text-accent underline decoration-accent underline-offset-4 hover:text-ink"
        >
          Apps (17 pods) on Tools →
        </Link>
      </div>

      {/* Quick jump cards when viewing the Field Manual */}
      {active === "manual" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => selectView("command")}
            className="group flex flex-col justify-between rounded-sm border border-line bg-surface p-4 text-left transition-colors hover:border-ink"
          >
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Integrated · Command</span>
              <p className="mt-1 font-semibold text-ink group-hover:text-accent">Command Portal</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                P0–P2 attention rules, sanitized error codes, 10-worker pulse, and 7 control-plane pods.
              </p>
            </div>
            <span className="mt-3 font-mono text-[11px] text-ink group-hover:text-accent">Switch to Command →</span>
          </button>

          <button
            type="button"
            onClick={() => selectView("pipeline")}
            className="group flex flex-col justify-between rounded-sm border border-line bg-surface p-4 text-left transition-colors hover:border-ink"
          >
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Integrated · Pipeline</span>
              <p className="mt-1 font-semibold text-ink group-hover:text-accent">10-Worker Pipeline</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Deterministic cs-01..cs-10 stages, PA-XXXX trails, local spools, and tools/&lt;case&gt;/ sub-tools.
              </p>
            </div>
            <span className="mt-3 font-mono text-[11px] text-ink group-hover:text-accent">Switch to Pipeline →</span>
          </button>

          <button
            type="button"
            onClick={() => selectView("decide")}
            className="group flex flex-col justify-between rounded-sm border border-line bg-surface p-4 text-left transition-colors hover:border-ink"
          >
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Integrated · Decide</span>
              <p className="mt-1 font-semibold text-ink group-hover:text-accent">Decide &amp; Public Edits</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Candidate determinations in cs-04-decide and anonymous ✎ Edit proposals behind the 5-layer shield.
              </p>
            </div>
            <span className="mt-3 font-mono text-[11px] text-ink group-hover:text-accent">Switch to Decide →</span>
          </button>

          <button
            type="button"
            onClick={() => selectView("how-we-decide")}
            className="group flex flex-col justify-between rounded-sm border border-line bg-surface p-4 text-left transition-colors hover:border-ink"
          >
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent">Integrated · Section M</span>
              <p className="mt-1 font-semibold text-ink group-hover:text-accent">How We Decide</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Five binary knockout gates, 100-point weighted rubric, 14-state lifecycle, and clean-room rules.
              </p>
            </div>
            <span className="mt-3 font-mono text-[11px] text-ink group-hover:text-accent">Switch to Section M →</span>
          </button>
        </div>
      )}

      {/* Active Integrated Views */}
      {(active === "manual" || active === "all") && (
        <div id="manual" className="mt-12">
          {manualView}
        </div>
      )}

      {(active === "command" || active === "all") && (
        <div id="command" className={active === "all" ? "mt-20 border-t-2 border-ink pt-12" : "mt-10"}>
          {commandView}
        </div>
      )}

      {(active === "pipeline" || active === "all") && (
        <div id="pipeline" className={active === "all" ? "mt-20 border-t-2 border-ink pt-12" : "mt-10"}>
          {pipelineView}
        </div>
      )}

      {(active === "decide" || active === "all") && (
        <div id="decide" className={active === "all" ? "mt-20 border-t-2 border-ink pt-12" : "mt-10"}>
          {decideView}
        </div>
      )}

      {(active === "how-we-decide" || active === "all") && (
        <div id="how-we-decide" className={active === "all" ? "mt-20 border-t-2 border-ink pt-12" : "mt-10"}>
          {howWeDecideView}
        </div>
      )}
    </div>
  );
}
