import type { Metadata } from "next";
import { DocArticle } from "@/components/DocArticle";
import { platform } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return platform.slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/platform/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { doc } = await platform.load(slug);
  return { title: doc.title, description: doc.summary, alternates: { canonical: doc.href } };
}

export default async function PlatformPage({ params }: PageProps<"/platform/[slug]">) {
  const { slug } = await params;
  const [{ doc, Content }, docs] = await Promise.all([platform.load(slug), platform.list()]);

  return (
    <DocArticle
      section={{ name: "Platform", href: "/platform/", folder: platform.folder }}
      doc={doc}
      group={platform.groupOf(doc)}
      docs={docs}
      Content={Content}
    />
  );
}
