import type { MetadataRoute } from "next";
import { tools } from "@/data/catalog";
import { site } from "@/data/site";
import { guides, platform } from "@/lib/docs";

export const dynamic = "force-static";

/** "2026-11" becomes the first of that month, which is as precise as the pages record. */
function monthDate(value?: string): Date | undefined {
  return value ? new Date(`${value}-01T00:00:00Z`) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [guideDocs, platformDocs] = await Promise.all([guides.list(), platform.list()]);
  const docs = [...guideDocs, ...platformDocs].map((doc) => ({ path: doc.href, lastModified: monthDate(doc.revised) }));
  const paths: { path: string; lastModified?: Date }[] = [
    { path: "/" },
    { path: "/tools/" },
    ...tools.map((tool) => ({ path: `/tools/${tool.slug}/` })),
    { path: "/guides/" },
    { path: "/platform/" },
    ...docs,
    { path: "/status/" },
    { path: "/about/" },
  ];
  return paths.map(({ path, lastModified }) => ({ url: `${site.url}${path}`, ...(lastModified ? { lastModified } : {}) }));
}
