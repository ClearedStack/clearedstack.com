import { HealthChip, type HealthState } from "@/components/StatusChip";

export type PulseMetric = {
  label: string;
  value: string;
  unit?: string;
  timestamp?: string;
};

export function PulseStrip({
  state,
  summary,
  metrics,
  freshness = "Snapshot preview · SSE >15s triggers stale",
}: {
  state: HealthState;
  summary: string;
  metrics: PulseMetric[];
  freshness?: string;
}) {
  const borderClass =
    state === "erroring"
      ? "border-danger/50"
      : state === "recovering"
        ? "border-warn/50"
        : state === "stale"
          ? "border-dashed border-muted/50"
          : "border-line";

  return (
    <section
      aria-label="Platform heartbeat"
      className={`rounded-sm border ${borderClass} bg-surface px-4 py-3`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <HealthChip state={state} />
          <span className="text-sm font-medium text-ink">{summary}</span>
        </div>
        <span className="font-mono text-[11px] text-muted">{freshness}</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{m.label}</dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-ink">
              {m.value}
              {m.unit ? <span className="ml-1 text-xs font-normal text-muted">{m.unit}</span> : null}
            </dd>
            {m.timestamp ? (
              <span className="font-mono text-[10px] text-muted">{m.timestamp}</span>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}
