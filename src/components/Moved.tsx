import Link from "next/link";

/**
 * Shown at an address whose page has moved. The site is exported as plain
 * files, so it cannot answer with a redirect; the refresh tag sends the
 * browser on, and the link is there for anything that ignores it.
 */
export function Moved({ to, title }: { to: string; title: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24">
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">This page has moved</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">It is now at “{title}”.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Guides about how the project is built and run were gathered into the Platform section, and each tool’s
        specification is now on the tool’s own page. You should be taken there in a moment. If not, go to{" "}
        <Link href={to} className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          {title}
        </Link>
        .
      </p>
    </div>
  );
}
