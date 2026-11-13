import { readdirSync } from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";

/**
 * Guides are the .mdx files in src/guides. Each one exports a `meta` object
 * and its content. To add a guide, add a file there; nothing else needs
 * to change.
 */
export type GuideMeta = {
  title: string;
  /** One sentence shown in the list and under the title. */
  summary: string;
  /** Position in the list, lowest first. */
  order: number;
};

export type Guide = GuideMeta & { slug: string };

type GuideModule = { default: ComponentType; meta: GuideMeta };

const guidesDir = path.join(process.cwd(), "src", "guides");

export function guideSlugs(): string[] {
  return readdirSync(guidesDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function loadGuide(slug: string): Promise<{ guide: Guide; Content: ComponentType }> {
  const mod = (await import(`@/guides/${slug}.mdx`)) as GuideModule;
  if (!mod.meta?.title || !mod.meta.summary || typeof mod.meta.order !== "number") {
    throw new Error(`src/guides/${slug}.mdx must export meta = { title, summary, order }`);
  }
  return { guide: { slug, ...mod.meta }, Content: mod.default };
}

export async function listGuides(): Promise<Guide[]> {
  const loaded = await Promise.all(guideSlugs().map((slug) => loadGuide(slug)));
  return loaded.map(({ guide }) => guide).sort((a, b) => a.order - b.order);
}
