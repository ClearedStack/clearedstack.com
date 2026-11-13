"use client";

import { useState } from "react";

type ProposalState = "idle" | "proposed";

/**
 * A preview of the edit-proposal form described in the platform pages. The
 * site is a static export with nothing behind it, so this sends nothing: what
 * is typed stays in the page and is dropped when the form closes. The labels
 * say so.
 */
export function EditTrigger({
  elementId,
  ownerRepo,
  targetLabel,
  editClass = "CONFIG",
}: {
  elementId: string;
  ownerRepo: string;
  targetLabel: string;
  editClass?: "DATA" | "CONFIG" | "ISSUE";
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ProposalState>("idle");
  const [proposalText, setProposalText] = useState("");
  const [rationale, setRationale] = useState("");
  const [honeypot, setHoneypot] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot.trim() !== "" || !proposalText.trim()) return;
    setState("proposed");
    setOpen(false);
  }

  return (
    <>
      {state === "proposed" ? (
        <span
          className="inline-flex items-center gap-1 rounded-sm border border-accent px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-accent"
          title={`In the design this would be routed to ${ownerRepo}. Nothing was sent.`}
        >
          <span>Preview only</span>
          <span aria-hidden="true">·</span>
          <span>nothing sent</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-ink hover:text-ink"
          aria-label={`Preview the edit form for ${targetLabel}`}
          title="Preview of the edit form. Nothing is sent."
        >
          <span aria-hidden="true">✎</span>
          <span>Edit</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/30"
          role="dialog"
          aria-modal="true"
          aria-label={`Propose edit: ${targetLabel}`}
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col justify-between border-l border-line bg-surface p-6 shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-accent">
                  Edit proposal · preview only
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-sm border border-line px-2 py-0.5 font-mono text-xs text-muted hover:text-ink"
                >
                  Close
                </button>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-ink">{targetLabel}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-2 border border-line bg-paper p-3 font-mono text-xs">
                <div>
                  <dt className="text-muted">Owning repo</dt>
                  <dd className="text-ink">{ownerRepo}</dd>
                </div>
                <div>
                  <dt className="text-muted">Edit class</dt>
                  <dd className="text-ink">{editClass}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted">Element ID</dt>
                  <dd className="text-ink">{elementId}</dd>
                </div>
              </dl>

              {/* Honeypot field for bot filtering */}
              <div className="hidden" aria-hidden="true">
                <label>
                  Website URL
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </label>
              </div>

              <label className="mt-4 block text-xs font-mono uppercase tracking-wider text-muted">
                Proposed change (max 4 KB)
                <textarea
                  required
                  maxLength={4096}
                  rows={4}
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder="Describe the change or paste the updated rule/value..."
                  className="mt-1.5 w-full rounded-sm border border-line bg-paper p-2.5 font-sans text-sm text-ink focus:border-ink focus:outline-none"
                />
              </label>

              <label className="mt-3 block text-xs font-mono uppercase tracking-wider text-muted">
                Why (optional)
                <input
                  type="text"
                  maxLength={240}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Link to regulation or observed bug..."
                  className="mt-1.5 w-full rounded-sm border border-line bg-paper p-2 font-sans text-sm text-ink focus:border-ink focus:outline-none"
                />
              </label>

              <p className="mt-3 text-xs leading-relaxed text-muted">
                <strong className="font-medium text-ink">This form is a preview and sends nothing.</strong> In the
                design, a proposal passes five checks, waits for the owner’s approval and is then routed to{" "}
                <code className="text-ink">{ownerRepo}</code>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-sm border border-line px-3 py-1.5 font-mono text-xs text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-accent px-4 py-1.5 font-mono text-xs font-medium text-accent-ink hover:opacity-90"
              >
                Preview submit · sends nothing
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
