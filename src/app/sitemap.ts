import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { guideSlugs } from "@/lib/guides";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/tools/",
    "/how-we-decide/",
    "/guides/",
    ...guideSlugs().map((slug) => `/guides/${slug}/`),
    "/about/",
  ];
  return paths.map((path) => ({ url: `${site.url}${path}` }));
}
