import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle } from "@/components/DocArticle";
import { Moved } from "@/components/Moved";
import { StatusChip } from "@/components/StatusChip";
import { findTool, toolsForGuide } from "@/data/catalog";
import { guides, movedGuideSlugs, movedGuideTarget, platform } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...guides.slugs(), ...movedGuideSlugs()].map((slug) => ({ slug }));
}

/** Where an old guide address now points, and the title of the page there. */
async function movedTo(slug: string): Promise<{ to: string; title: string } | undefined> {
  const to = movedGuideTarget(slug);
  if (!to) return undefined;
  const title = to.startsWith("/tools/")
    ? findTool(to.split("/")[2])?.name
    : (await platform.list()).find((doc) => doc.href === to)?.title;
  if (!title) throw new Error(`The old guide address "${slug}" is sent to ${to}, which does not exist.`);
  return { to, title };
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const moved = await movedTo(slug);
  if (moved) {
    return { title: moved.title, alternates: { canonical: moved.to }, robots: { index: false, follow: true } };
  }
  const { doc } = await guides.load(slug);
  return { title: doc.title, description: doc.summary, alternates: { canonical: doc.href } };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const moved = await movedTo(slug);
  if (moved) return <Moved {...moved} />;

  const [{ doc, Content }, docs] = await Promise.all([guides.load(slug), guides.list()]);
  const related = toolsForGuide(slug);

  return (
    <DocArticle
      section={{ name: "Guides", href: "/guides/", folder: guides.folder }}
      doc={doc}
      group={guides.groupOf(doc)}
      docs={docs}
      Content={Content}
    >
      {related.length > 0 ? (
        <section aria-labelledby="related-tools" className="mt-14 max-w-[42rem] border-t border-line pt-6">
          <h2 id="related-tools" className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Tools for this subject
          </h2>
          <ul className="mt-3">
            {related.map((tool) => (
              <li key={tool.slug} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <span className="min-w-0">
                  <Link
                    href={`/tools/${tool.slug}/`}
                    className="font-medium underline decoration-accent underline-offset-4 hover:text-accent"
                  >
                    {tool.name}
                  </Link>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{tool.summary}</span>
                </span>
                <StatusChip status={tool.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DocArticle>
  );
}
