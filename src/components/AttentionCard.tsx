import { EditTrigger } from "@/components/EditTrigger";
import { HealthChip, type HealthState } from "@/components/StatusChip";
import { WhyDrawer } from "@/components/WhyDrawer";

export function AttentionCard({
  priority,
  title,
  summary,
  state,
  errorCode,
  ownerRepo,
  elementId,
  whyTitle,
  whySummary,
  whyGuideHref,
  whyDetails,
  editClass = "ISSUE",
}: {
  priority: "P0" | "P1" | "P2";
  title: string;
  summary: string;
  state: HealthState;
  errorCode?: string;
  ownerRepo: string;
  elementId: string;
  whyTitle?: string;
  whySummary?: string;
  whyGuideHref?: string;
  whyDetails?: string[];
  editClass?: "DATA" | "CONFIG" | "ISSUE";
}) {
  const accentBorder =
    priority === "P0"
      ? "border-l-2 border-l-danger"
      : priority === "P1"
        ? "border-l-2 border-l-warn"
        : "border-l-2 border-l-accent";

  const badgeTone =
    priority === "P0"
      ? "text-danger"
      : priority === "P1"
        ? "text-warn"
        : "text-accent";

  return (
    <div className={`rounded-sm border border-line ${accentBorder} bg-surface p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-mono text-xs font-semibold uppercase tracking-wider ${badgeTone}`}>
            {priority}
          </span>
          <span className="font-mono text-sm font-semibold text-ink">{title}</span>
          {errorCode ? (
            <code className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[11px] text-ink">
              {errorCode}
            </code>
          ) : null}
        </div>
        <HealthChip state={state} />
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
        <span className="font-mono text-[11px] text-muted">
          Owner repo: <code className="text-ink">{ownerRepo}</code>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {whyTitle && whySummary && whyGuideHref ? (
            <WhyDrawer
              title={whyTitle}
              summary={whySummary}
              guideHref={whyGuideHref}
              details={whyDetails ?? []}
            />
          ) : null}
          <EditTrigger
            elementId={elementId}
            ownerRepo={ownerRepo}
            targetLabel={title}
            editClass={editClass}
          />
        </div>
      </div>
    </div>
  );
}
