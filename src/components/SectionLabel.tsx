/**
 * Small mono heading above each block. The home page borrows its section
 * letters from the Uniform Contract Format (Section B is prices, C is the
 * statement of work, and so on), which every reader of this site has had to
 * learn the hard way.
 */
export function SectionLabel({ section, children }: { section?: string; children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
      {section ? <span className="text-accent">{section} · </span> : null}
      {children}
    </p>
  );
}
