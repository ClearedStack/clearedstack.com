import { statusLabel, type ToolStatus } from "@/data/catalog";

const styles: Record<ToolStatus, string> = {
  planned: "border-line text-muted",
  building: "border-accent text-accent",
  live: "border-accent bg-accent text-accent-ink",
};

export function StatusChip({ status }: { status: ToolStatus }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap ${styles[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}

export function DraftChip() {
  return (
    <span className="inline-block shrink-0 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap text-muted">
      Draft · architecture preview
    </span>
  );
}

export type HealthState = "healthy" | "idle" | "erroring" | "recovering" | "stale" | "empty";

const healthStyles: Record<HealthState, { cls: string; glyph: string; label: string }> = {
  healthy: { cls: "border-accent text-accent", glyph: "●", label: "Healthy" },
  idle: { cls: "border-line text-muted", glyph: "○", label: "Idle" },
  recovering: { cls: "border-warn text-warn", glyph: "◐", label: "Recovering" },
  stale: { cls: "border-warn border-dashed text-warn", glyph: "◷", label: "Stale" },
  erroring: { cls: "border-danger text-danger", glyph: "▲", label: "Error" },
  empty: { cls: "border-line text-muted", glyph: "◌", label: "Empty" },
};

export function HealthChip({ state, label }: { state: HealthState; label?: string }) {
  const s = healthStyles[state];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap ${s.cls}`}
    >
      <span aria-hidden="true">{s.glyph}</span>
      <span>{label ?? s.label}</span>
    </span>
  );
}
