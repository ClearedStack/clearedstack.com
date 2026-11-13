export function MetricCell({
  label,
  value,
  unit,
  timestamp,
}: {
  label: string;
  value: string | number;
  unit?: string;
  timestamp?: string;
}) {
  return (
    <div className="rounded-sm border border-line bg-surface px-4 py-3">
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink">
        {value}
        {unit ? <span className="ml-1.5 text-xs font-normal text-muted">{unit}</span> : null}
      </div>
      {timestamp ? (
        <div className="mt-1 font-mono text-[10px] text-muted">Updated {timestamp}</div>
      ) : null}
    </div>
  );
}
