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
      Draft · intent, not running yet
    </span>
  );
}
