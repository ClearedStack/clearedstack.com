import type { MetadataRoute } from "next";
import { tools } from "@/data/catalog";
import { site } from "@/data/site";
import { guides, platform } from "@/lib/docs";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/tools/",
    ...tools.map((tool) => `/tools/${tool.slug}/`),
    "/guides/",
    ...guides.slugs().map((slug) => `/guides/${slug}/`),
    "/platform/",
    ...platform.slugs().map((slug) => `/platform/${slug}/`),
    "/about/",
  ];
  return paths.map((path) => ({ url: `${site.url}${path}` }));
}
