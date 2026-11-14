import type { Metadata } from "next";
import Link from "next/link";
import { DocIndex } from "@/components/DocIndex";
import { SectionLabel } from "@/components/SectionLabel";
import { DocStatusChip } from "@/components/StatusChip";
import { liveCount, tools } from "@/data/catalog";
import { components, controlPlane, findComponent, stageLabel, workers, type PlatformComponent } from "@/data/platform";
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

function RegistryTable({
  caption,
  rows,
  specs,
}: {
  caption: string;
  rows: PlatformComponent[];
  specs: Set<string>;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-sm border border-line bg-surface">
      <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
        <caption className="border-b border-line px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
            <th scope="col" className="px-4 py-2.5 font-normal">
              Name
            </th>
            <th scope="col" className="px-4 py-2.5 font-normal">
              Formerly
            </th>
            <th scope="col" className="px-4 py-2.5 font-normal">
              Responsible for
            </th>
            <th scope="col" className="px-4 py-2.5 font-normal whitespace-nowrap">
              Depends on
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug} className="border-b border-line align-top last:border-b-0">
              <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap">
                {stageLabel(row) ? (
                  <span className="mr-2 font-mono text-xs font-normal text-accent">
                    {String(row.stage).padStart(2, "0")}
                  </span>
                ) : null}
                {specs.has(row.slug) ? (
                  <Link href={`/platform/${row.slug}/`} className={inlineLink}>
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
              </th>
              <td className="px-4 py-3 font-mono text-xs text-muted">
                <span className="whitespace-nowrap">{row.formerly}</span>
                {row.earlierNames?.length ? (
                  <span className="block font-sans whitespace-nowrap">then {row.earlierNames.join(", ")}</span>
                ) : null}
              </td>
              <td className="px-4 py-3 leading-relaxed text-muted">{row.responsibility}</td>
              <td className="px-4 py-3 text-muted">
                {row.dependsOn.length > 0 ? row.dependsOn.map((dep) => findComponent(dep)!.name).join(", ") : "none"}
              </td>
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
              <strong className="font-medium text-ink">Every platform component is a draft.</strong> The versions
              recorded in the naming registry end in <code className="text-ink">-draft</code>.
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
            page’s source file. Day-to-day changes are recorded in the{" "}
            <Link href="/status/" className={inlineLink}>
              work log
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mt-12">
        <DocIndex
          groups={platform.groups}
          noun="page"
          placeholder="Filter: rubric, Shipkeeper, clean room, backups…"
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

      <section id="registry" aria-labelledby="registry-title" className="mt-16 scroll-mt-6 border-t border-line pt-10">
        {/* Older links point at #components. */}
        <span id="components" />
        <SectionLabel>Naming registry</SectionLabel>
        <h2 id="registry-title" className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.015em] text-balance">
          {components.length} components, each with a name of its own.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Every part of the platform has one canonical name, chosen to describe what the part is responsible for and
          not how it is built, so the name survives a change of implementation. Each name links to that
          component’s specification, which carries its full entry: boundaries, repository, container image and
          dependencies. These are the parts of the factory, not tools for contracting work. Those are in the{" "}
          <Link href="/tools/" className={inlineLink}>
            catalog
          </Link>
          .
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The registry is one file,{" "}
          <a href={`${site.repo}/blob/main/src/data/registry.json`} rel="noopener" className={inlineLink}>
            src/data/registry.json
          </a>
          , also published as{" "}
          <a href="/platform/registry.json" className={inlineLink}>
            /platform/registry.json
          </a>{" "}
          for manifests, pipelines and other repositories to read. A name is changed there and nowhere else.
        </p>
        <RegistryTable caption="Pipeline workers · in stage order" rows={workers} specs={specs} />
        <RegistryTable caption="Control plane" rows={controlPlane} specs={specs} />
      </section>
    </div>
  );
}
