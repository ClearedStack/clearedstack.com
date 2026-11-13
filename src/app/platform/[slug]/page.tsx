import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle } from "@/components/DocArticle";
import { Moved } from "@/components/Moved";
import { dependents, findComponent, registryMeta, stageLabel } from "@/data/platform";
import { movedPlatformSlugs, movedPlatformTarget, platform } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...platform.slugs(), ...movedPlatformSlugs()].map((slug) => ({ slug }));
}

/** Where a page under a component's old identifier now lives. */
async function movedTo(slug: string): Promise<{ to: string; title: string } | undefined> {
  const to = movedPlatformTarget(slug);
  if (!to) return undefined;
  const target = (await platform.list()).find((doc) => doc.href === to);
  if (!target) throw new Error(`The registry sends "${slug}" to ${to}, but there is no src/platform page for it.`);
  return { to, title: target.title };
}

export async function generateMetadata({ params }: PageProps<"/platform/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const moved = await movedTo(slug);
  if (moved) {
    return { title: moved.title, alternates: { canonical: moved.to }, robots: { index: false, follow: true } };
  }
  const { doc } = await platform.load(slug);
  return { title: doc.title, description: doc.summary, alternates: { canonical: doc.href } };
}

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";
const term = "font-mono text-[11px] uppercase tracking-wider text-muted";

export default async function PlatformPage({ params }: PageProps<"/platform/[slug]">) {
  const { slug } = await params;
  const moved = await movedTo(slug);
  if (moved) return <Moved {...moved} />;

  const [{ doc, Content }, docs] = await Promise.all([platform.load(slug), platform.list()]);
  const component = findComponent(slug);
  const usedBy = component ? dependents(component.slug) : [];
  const names = (list: { slug: string; name: string }[]) =>
    list.map((item, index) => (
      <span key={item.slug}>
        {index > 0 ? ", " : ""}
        <Link href={`/platform/${item.slug}/`} className={inlineLink}>
          {item.name}
        </Link>
      </span>
    ));

  return (
    <DocArticle
      section={{ name: "Platform", href: "/platform/", folder: platform.folder }}
      doc={doc}
      group={platform.groupOf(doc)}
      docs={docs}
      Content={Content}
      before={
        component ? (
          <section
            aria-label="Registry entry"
            className="mb-8 min-w-0 max-w-[42rem] rounded-sm border border-line bg-surface p-4 sm:p-5 lg:col-span-2"
          >
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              Registry entry{stageLabel(component) ? ` · ${stageLabel(component)}` : ""}
            </p>
            <p className="mt-2 leading-relaxed text-ink">{component.responsibility}</p>
            <dl className="mt-4 grid gap-x-8 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className={term}>Formerly</dt>
                <dd className="mt-0.5 font-mono text-[13px]">{component.formerly}</dd>
              </div>
              <div className="min-w-0">
                <dt className={term}>Namespace</dt>
                <dd className="mt-0.5 font-mono text-[13px]">{component.namespace}</dd>
              </div>
              <div className="min-w-0">
                <dt className={term}>Repository</dt>
                <dd className="mt-0.5 font-mono text-[13px]">{component.repository}</dd>
              </div>
              <div className="min-w-0">
                <dt className={term}>Container image</dt>
                <dd className="mt-0.5 font-mono text-[13px] break-all">
                  {component.image.includes(" ") ? component.image : `${registryMeta.imageRegistry}/${component.image}`}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className={term}>Depends on</dt>
                <dd className="mt-0.5 text-muted">
                  {component.dependsOn.length > 0
                    ? names(component.dependsOn.map((dep) => findComponent(dep)!))
                    : "Nothing else in the platform"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className={term}>Depended on by</dt>
                <dd className="mt-0.5 text-muted">{usedBy.length > 0 ? names(usedBy) : "Nothing else in the platform"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={term}>Boundaries</dt>
                <dd className="mt-1 text-muted">
                  <ul className="flex flex-col gap-1">
                    {component.interfaces.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden="true" className="text-accent">
                          –
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              From the{" "}
              <Link href="/platform/#registry" className={inlineLink}>
                naming registry
              </Link>
              , which is the one place this component’s name is written down.
            </p>
          </section>
        ) : null
      }
    />
  );
}
