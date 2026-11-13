import type { Metadata } from "next";
import Link from "next/link";
import { DocIndex } from "@/components/DocIndex";
import { SectionLabel } from "@/components/SectionLabel";
import { DocStatusChip } from "@/components/StatusChip";
import { liveCount, tools } from "@/data/catalog";
import { controlPlaneApps, workerApps, type PlatformApp } from "@/data/platform";
import { site } from "@/data/site";
import { platform } from "@/lib/docs";
import { docStatus, type DocStatus } from "@/lib/status";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "How ClearedStack decides what to build, builds each tool from the public rule, and is designed to run: the ten-worker pipeline, the cluster, public edits and the decisions behind them.",
  alternates: { canonical: "/platform/" },
};

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";
const statuses = Object.keys(docStatus) as DocStatus[];

function ComponentTable({ caption, apps, specs }: { caption: string; apps: PlatformApp[]; specs: Set<string> }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-sm border border-line bg-surface">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="border-b border-line px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
            <th scope="col" className="px-4 py-2.5 font-normal">
              Component
            </th>
            <th scope="col" className="px-4 py-2.5 font-normal">
              Job
            </th>
            <th scope="col" className="px-4 py-2.5 font-normal whitespace-nowrap">
              Memory budget
            </th>
            <th scope="col" className="px-4 py-2.5 font-normal">
              Version
            </th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => (
            <tr key={app.id} className="border-b border-line align-top last:border-b-0">
              <th scope="row" className="px-4 py-3 font-mono text-[13px] font-medium whitespace-nowrap">
                {specs.has(app.id) ? (
                  <Link href={`/platform/${app.id}/`} className={inlineLink}>
                    {app.name}
                  </Link>
                ) : (
                  app.name
                )}
              </th>
              <td className="px-4 py-3 leading-relaxed text-muted">{app.role}</td>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted">{app.ramBudget}</td>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted">{app.version}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PlatformIndexPage() {
  const docs = await platform.list();
  const specs = new Set(docs.filter((doc) => doc.group === "components").map((doc) => doc.slug));

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel section="Section J">Attachments</SectionLabel>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>

      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
        Platform
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        How the project decides what to build, builds each tool from the public rule, and is designed to run. You do
        not need any of this to use a{" "}
        <Link href="/tools/" className={inlineLink}>
          tool
        </Link>{" "}
        or read a{" "}
        <Link href="/guides/" className={inlineLink}>
          guide
        </Link>
        . It is here so that anyone can check how decisions are made.
      </p>

      <section
        id="status"
        aria-labelledby="status-title"
        className="mt-10 scroll-mt-6 grid gap-8 rounded-sm border border-line bg-surface p-5 sm:p-6 lg:grid-cols-2 lg:gap-12"
      >
        <div>
          <h2 id="status-title" className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            What is true today
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed text-muted">
            <li>
              <strong className="font-medium text-ink">This website is a folder of plain files.</strong> It has no
              server, database or API behind it, so nothing on it can show live cluster data.
            </li>
            <li>
              <strong className="font-medium text-ink">
                {liveCount} of {tools.length} tools are live.
              </strong>{" "}
              A tool is marked live on the day it works and not before.
            </li>
            <li>
              <strong className="font-medium text-ink">Every platform component is a draft.</strong> The versions in
              the table below end in <code className="text-ink">-draft</code>.
            </li>
            <li>
              <strong className="font-medium text-ink">Figures and buttons on these pages are samples.</strong> Status
              panels show example values, and the Edit button is a preview that sends nothing.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">What the labels mean</h2>
          <dl className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed text-muted">
            {statuses.map((status) => (
              <div key={status} className="grid gap-x-4 gap-y-1 sm:grid-cols-[5.5rem_1fr]">
                <dt className="pt-0.5">
                  <DocStatusChip status={status} />
                </dt>
                <dd>{docStatus[status].meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            A page moves up a label when the thing it describes does. The label is one line at the top of the
            page’s source file.
          </p>
        </div>
      </section>

      <div className="mt-12">
        <DocIndex
          groups={platform.groups}
          noun="page"
          placeholder="Filter: rubric, cs-store, clean room, backups…"
          docs={docs.map((doc) => ({
            slug: doc.slug,
            href: doc.href,
            code: doc.code,
            title: doc.title,
            summary: doc.summary,
            group: doc.group,
            minutes: doc.minutes,
            status: doc.status,
            topics: doc.headings.map((heading) => heading.text).filter((text) => text !== "Sources"),
          }))}
        />
      </div>

      <section id="components" aria-labelledby="components-title" className="mt-16 scroll-mt-6 border-t border-line pt-10">
        <SectionLabel>Components</SectionLabel>
        <h2 id="components-title" className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.015em] text-balance">
          {controlPlaneApps.length} control-plane services and {workerApps.length} workers.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Each name links to that component’s specification. For how they fit together, read{" "}
          <Link href="/platform/cluster-architecture/" className={inlineLink}>
            Cluster architecture
          </Link>{" "}
          and{" "}
          <Link href="/platform/pipeline/" className={inlineLink}>
            The pipeline and its ten workers
          </Link>
          . These are the parts of the factory, not tools for contracting work. Those are in the{" "}
          <Link href="/tools/" className={inlineLink}>
            catalog
          </Link>
          .
        </p>
        <ComponentTable caption="Control plane · namespace clearedstack" apps={controlPlaneApps} specs={specs} />
        <ComponentTable caption="Pipeline workers · namespace cs-workers" apps={workerApps} specs={specs} />
      </section>
    </div>
  );
}
