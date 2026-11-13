import { HealthChip, type HealthState } from "@/components/StatusChip";

export function TrailRow({
  id,
  label,
  detail,
  lane,
  state,
  timestamp,
}: {
  id: string;
  label: string;
  detail: string;
  lane?: "urgent" | "normal" | "backfill";
  state: HealthState;
  timestamp?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-surface px-4 py-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <code className="font-mono text-xs font-semibold text-ink">{id}</code>
        <span className="font-medium text-ink">{label}</span>
        <span className="text-xs text-muted">{detail}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {lane ? (
          <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
            {lane}
          </span>
        ) : null}
        <HealthChip state={state} />
        {timestamp ? <span className="font-mono text-[11px] text-muted">{timestamp}</span> : null}
      </div>
    </div>
  );
}
