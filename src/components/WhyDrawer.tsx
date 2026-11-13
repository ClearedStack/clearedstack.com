"use client";

import { useEffect, useState } from "react";

export function WhyDrawer({
  title,
  summary,
  guideHref,
  details,
}: {
  title: string;
  summary: string;
  guideHref?: string;
  details: string[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-ink hover:text-ink"
        aria-label={`Why: ${title}`}
      >
        <span>?</span>
        <span>Why</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/30"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-md flex-col justify-between border-l border-line bg-surface p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-accent">
                  Why this rule exists
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-sm border border-line px-2 py-0.5 font-mono text-xs text-muted hover:text-ink"
                >
                  Esc
                </button>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.01em] text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>
              <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-ink">
                {details.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-mono text-accent">-&gt;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {guideHref && (
              <div className="border-t border-line pt-4">
                <a
                  href={guideHref}
                  className="font-mono text-xs uppercase tracking-wider text-accent underline underline-offset-4 hover:text-ink"
                >
                  Read full big-picture guide -&gt;
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
