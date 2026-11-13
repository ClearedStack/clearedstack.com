import type { Metadata } from "next";
import Link from "next/link";
import { StatusChip } from "@/components/StatusChip";
import { categoryOf, findTool, tools, toolsIn, type Tool } from "@/data/catalog";
import { site } from "@/data/site";
import { formatMonth, guides, loadToolSpec, toolSpecSlugs } from "@/lib/docs";
import { slugify } from "@/lib/slug";

export const dynamicParams = false;

export function generateStaticParams() {
  const stray = toolSpecSlugs().filter((slug) => !findTool(slug));
  if (stray.length > 0) {
    throw new Error(`src/tools has a specification for ${stray.join(", ")}, which is not in src/data/catalog.ts.`);
  }
  return tools.map((tool) => ({ slug: tool.slug }));
}

function load(slug: string): Tool {
  const tool = findTool(slug);
  if (!tool) throw new Error(`No tool named "${slug}" in src/data/catalog.ts.`);
  return tool;
}

export async function generateMetadata({ params }: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = load(slug);
  return { title: tool.name, description: tool.summary, alternates: { canonical: `/tools/${slug}/` } };
}

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";
const button =
  "inline-flex items-center justify-center rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors";

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-line py-8 lg:grid-cols-[14rem_minmax(0,42rem)] lg:gap-16">
      <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-accent lg:pt-1">{label}</h2>
      <div className="leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="text-accent">
            –
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const promises = [
  ["Free and open source.", "No paid tier, no ads, and the code is public."],
  ["Runs in your browser.", "What you type or open is not sent anywhere."],
  ["No tracking.", "No accounts, cookies or analytics."],
  ["Shows its sources.", "Each result names the rule it rests on, so you can check it."],
  ["Says what it does not do.", "It is an aid for your own work, not professional advice."],
];

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = load(slug);
  const category = categoryOf(tool);
  const isLive = tool.status === "live";
  const others = toolsIn(tool.category).filter((item) => item.slug !== tool.slug);

  const docs = await guides.list();
  const reading = (tool.guides ?? []).map((entry) => {
    const doc = docs.find((item) => item.slug === entry.slug);
    if (!doc) throw new Error(`Tool "${tool.slug}" points at guide "${entry.slug}", which is not in src/guides.`);
    const heading = entry.section ? doc.headings.find((item) => item.id === slugify(entry.section!)) : undefined;
    if (entry.section && !heading) {
      throw new Error(`Tool "${tool.slug}" points at “${entry.section}”, which is not a heading in ${entry.slug}.`);
    }
    return { doc, heading };
  });

  const spec = await loadToolSpec(tool.slug);
  const subject = encodeURIComponent(`Tool request: ${tool.name}`);

  return (
    <article className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        <Link href="/tools/" className="text-accent hover:underline">
          Tools
        </Link>{" "}
        ·{" "}
        <Link href={`/tools/#${category.id}`} className="hover:text-ink hover:underline">
          CLIN {category.clin} {category.name}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance">{tool.name}</h1>
        <StatusChip status={tool.status} />
      </div>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{tool.summary}</p>

      {isLive ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {tool.url ? (
            <a
              href={tool.url}
              className={`${button} border-ink bg-ink text-paper hover:border-accent hover:bg-accent hover:text-accent-ink`}
            >
              Open the tool
            </a>
          ) : null}
          {tool.repo ? (
            <a href={tool.repo} rel="noopener" className={`${button} border-line text-ink hover:border-ink`}>
              Read the source
            </a>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 max-w-[42rem] rounded-sm border border-dashed border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
          <strong className="font-medium text-ink">
            {tool.status === "building" ? "This tool is being built." : "This tool is planned."}
          </strong>{" "}
          There is nothing to open yet. What follows is the plan, and it can change before the tool ships.
          {reading.length > 0 ? " The guide below covers the same job by hand in the meantime." : ""}
          {spec ? (
            <>
              {" "}
              <a href="#specification" className={inlineLink}>
                Jump to the full specification
              </a>
              .
            </>
          ) : null}
        </p>
      )}

      <div className="mt-10">
        {tool.detail ? (
          <Block label={isLive ? "What it does" : "What it will do"}>
            <p className="text-ink">{tool.detail}</p>
          </Block>
        ) : null}

        {tool.inputs && tool.inputs.length > 0 ? (
          <Block label="You bring">
            <Bullets items={tool.inputs} />
          </Block>
        ) : null}

        {tool.outputs && tool.outputs.length > 0 ? (
          <Block label="You get">
            <Bullets items={tool.outputs} />
          </Block>
        ) : null}

        {tool.sources && tool.sources.length > 0 ? (
          <Block label="Built from">
            <ul className="flex flex-col gap-2">
              {tool.sources.map((source) => (
                <li key={source.name} className="flex gap-3">
                  <span aria-hidden="true" className="text-accent">
                    –
                  </span>
                  <span>
                    {source.url ? (
                      <a href={source.url} rel="noopener" className={inlineLink}>
                        {source.name}
                      </a>
                    ) : (
                      source.name
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              Only material the government has officially released to the public.{" "}
              <Link href="/guides/public-sources/" className={inlineLink}>
                Where the rules live
              </Link>{" "}
              shows how to find and cite each one.
            </p>
          </Block>
        ) : null}

        {reading.length > 0 ? (
          <Block label={isLive ? "Background" : "Do it by hand today"}>
            <ul className="flex flex-col gap-3">
              {reading.map(({ doc, heading }) => (
                <li key={`${doc.slug}-${heading?.id ?? ""}`}>
                  <Link href={heading ? `${doc.href}#${heading.id}` : doc.href} className={`font-medium ${inlineLink}`}>
                    {doc.title}
                  </Link>
                  {heading ? <span className="text-muted"> · {heading.text}</span> : null}
                  <span className="mt-1 block text-sm">{doc.summary}</span>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        {tool.provenance?.inspiredBy && tool.provenance.inspiredBy.length > 0 ? (
          <Block label="Where the idea came from">
            <p>
              {tool.provenance.inspiredBy.map((item, index) => (
                <span key={item.name}>
                  {index > 0 ? ", " : ""}
                  {item.url ? (
                    <a href={item.url} rel="noopener" className={inlineLink}>
                      {item.name}
                    </a>
                  ) : (
                    <span className="text-ink">{item.name}</span>
                  )}
                </span>
              ))}
              {tool.provenance.note ? `. ${tool.provenance.note}` : "."}
            </p>
            <p className="mt-3 text-sm">
              Only the job is taken, never code, text or design.{" "}
              <Link href="/platform/clean-room-and-credit/" className={inlineLink}>
                How ideas are credited
              </Link>
              .
            </p>
          </Block>
        ) : null}

        <Block label="True of every tool">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {promises.map(([title, body]) => (
              <div key={title}>
                <dt className="font-medium text-ink">{title}</dt>
                <dd className="mt-0.5 text-sm">{body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm">
            <Link href="/guides/your-data/" className={inlineLink}>
              What happens to what you type
            </Link>{" "}
            shows how to confirm this yourself, and{" "}
            <Link href="/guides/checking-results/" className={inlineLink}>
              Check a tool’s answer
            </Link>{" "}
            is the method for verifying a result.
          </p>
        </Block>

        {isLive ? (
          <Block label="Report a wrong result">
            <p>
              A wrong result is the most useful thing you can report. Write to{" "}
              <a href={`mailto:${site.email}`} className={inlineLink}>
                {site.email}
              </a>
              {tool.repo ? " or open an issue in the tool’s repository" : ""}, with made-up values in place of
              anything real.
            </p>
          </Block>
        ) : (
          <Block label="Want it sooner?">
            <p>
              Requests decide what is built first. Say what you would use it for, and what you do by hand today.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`mailto:${site.email}?subject=${subject}`}
                className={`${button} border-ink bg-ink text-paper hover:border-accent hover:bg-accent hover:text-accent-ink`}
              >
                Ask by email
              </a>
              <a
                href={`${site.repo}/issues/new?title=${subject}`}
                rel="noopener"
                className={`${button} border-line text-ink hover:border-ink`}
              >
                Open an issue on GitHub
              </a>
            </div>
            <p className="mt-4 text-sm">
              Issues are public. Leave out real contract data, real rates and anything controlled.{" "}
              <Link href="/guides/request-or-add-a-tool/" className={inlineLink}>
                How to write a useful request
              </Link>
              .
            </p>
          </Block>
        )}
      </div>

      {spec ? (
        <section id="specification" aria-labelledby="specification-title" className="scroll-mt-6 border-t-2 border-ink pt-8">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Specification{isLive ? "" : " · draft"}
          </p>
          <h2 id="specification-title" className="mt-3 text-3xl font-semibold tracking-[-0.015em]">
            {isLive ? "How it works, in detail" : "How it is meant to work, in detail"}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            The inputs, the logic, the checks the tool has to pass and the worked examples it is tested against.
            {isLive ? "" : " It is a draft, and the tool is built from it, so it can change until the tool ships."}
          </p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted">
            <span>{spec.minutes} min read</span>
            {spec.revised ? <span>Last revised {formatMonth(spec.revised)}</span> : null}
            <a
              href={`${site.repo}/blob/main/src/tools/${tool.slug}.mdx`}
              rel="noopener"
              className="underline underline-offset-4 hover:text-ink"
            >
              Source of this specification
            </a>
          </p>

          <div className="mt-8 grid gap-x-16 border-t border-line pt-8 lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)]">
            <div className="prose-cs min-w-0">
              <spec.Content />
            </div>
            {spec.headings.length > 1 ? (
              <aside className="hidden text-sm lg:block">
                <nav aria-label="In this specification" className="sticky top-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">In this specification</p>
                  <ol className="mt-3">
                    {spec.headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="block border-l border-line py-1 pl-3 leading-snug text-muted transition-colors hover:border-ink hover:text-ink"
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            ) : null}
          </div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <nav aria-labelledby="more-tools" className="mt-14 border-t border-line pt-8">
          <h2 id="more-tools" className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            More in {category.name}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/${item.slug}/`}
                  className="group flex h-full flex-col gap-1.5 rounded-sm border border-line p-4 transition-colors hover:border-ink"
                >
                  <span className="font-medium group-hover:text-accent">{item.name}</span>
                  <span className="text-sm leading-relaxed text-muted">{item.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </article>
  );
}
