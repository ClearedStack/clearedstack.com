import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel } from "@/components/SectionLabel";
import { findComponent } from "@/data/platform";
import { readWorkLog, workLogStates, type WorkLogState } from "@/lib/worklog";

export const metadata: Metadata = {
  title: "Work log",
  description: "What has changed on ClearedStack recently, one line per change, newest first.",
  alternates: { canonical: "/status/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";

const stateStyles: Record<WorkLogState, string> = {
  done: "border-accent text-accent",
  "in-progress": "border-accent border-dashed text-accent",
  blocked: "border-danger text-danger",
  planned: "border-line border-dashed text-muted",
};

function StateChip({ state }: { state: WorkLogState }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap ${stateStyles[state]}`}
    >
      {workLogStates[state]}
    </span>
  );
}

/** "muster" links to its specification; "site" and other areas are plain text. */
function Area({ area }: { area: string }) {
  const component = findComponent(area);
  if (component) {
    return (
      <Link href={`/platform/${component.slug}/`} className={inlineLink}>
        {component.name}
      </Link>
    );
  }
  return <span>{area}</span>;
}

export default function StatusPage() {
  const entries = readWorkLog();
  const days = [...new Set(entries.map((entry) => entry.date))];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:pt-20">
      <SectionLabel>Status</SectionLabel>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
        Work log
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        What has changed on the project, one line per change, newest first. Each line is written by the person or
        agent who did the work, when the change is made. This is a written record, not live data from the cluster:
        for how far along each part is, see the labels on the{" "}
        <Link href="/platform/" className={inlineLink}>
          platform pages
        </Link>
        .
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        The same log is published as{" "}
        <a href="/status.json" className={inlineLink}>
          /status.json
        </a>{" "}
        for scripts and agents to read.
      </p>

      {entries.length === 0 ? (
        <p className="mt-12 text-muted">Nothing has been logged yet.</p>
      ) : (
        <ol className="mt-12 flex flex-col gap-10">
          {days.map((day) => (
            <li key={day} className="border-t border-line pt-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                <time dateTime={day}>{day}</time>
              </h2>
              <ul className="mt-4 flex flex-col gap-4">
                {entries
                  .filter((entry) => entry.date === day)
                  .map((entry, index) => (
                    <li
                      key={`${day}-${index}`}
                      className="grid gap-x-6 gap-y-1 sm:grid-cols-[8rem_7rem_minmax(0,1fr)] sm:items-baseline"
                    >
                      <span className="font-medium">
                        <Area area={entry.area} />
                      </span>
                      <span>
                        <StateChip state={entry.state} />
                      </span>
                      <p className="max-w-2xl leading-relaxed text-muted">{entry.summary}</p>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
