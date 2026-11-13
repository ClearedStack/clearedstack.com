import Link from "next/link";

export type GuidesSubnavKey =
  | "library"
  | "command"
  | "apps"
  | "pipeline"
  | "decide"
  | "how-we-decide"
  | "guide";

const items: readonly { key: Exclude<GuidesSubnavKey, "guide">; label: string; href: string; tag: string }[] = [
  { key: "library", label: "Library", href: "/guides/", tag: "L.1–L.6" },
  { key: "command", label: "Command", href: "/guides/command/", tag: "Portal" },
  { key: "apps", label: "Apps", href: "/guides/apps/", tag: "cs-store" },
  { key: "pipeline", label: "Pipeline", href: "/guides/pipeline/", tag: "cs-01..10" },
  { key: "decide", label: "Decide", href: "/guides/decide/", tag: "Queue" },
  { key: "how-we-decide", label: "How We Decide", href: "/guides/how-we-decide/", tag: "Sec M" },
];

export function GuidesSubnav({ current }: { current: GuidesSubnavKey }) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Section L · Guides &amp; Live Factory
      </p>
      <nav aria-label="Guides and factory views" className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = current === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-xs transition-colors ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span className={`text-[10px] ${active ? "text-paper/75" : "text-accent"}`}>{item.tag}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
