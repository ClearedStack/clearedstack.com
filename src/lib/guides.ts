import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import { slugify } from "@/lib/slug";

/**
 * Guides are the .mdx files in src/guides. Each one exports a `meta` object
 * and its content. To add a guide, add a file there; the guides page, the
 * table of contents, the previous/next links and the sitemap pick it up.
 */

/**
 * The sections of the guides page, in the order they are shown. The numbering
 * follows Section L of a solicitation ("Instructions to offerors"), the way
 * the home page borrows Sections B, C, F and H.
 */
export const guideGroups = [
  {
    id: "start",
    code: "L.1",
    name: "Start here",
    blurb: "What the site is, where your information goes and how to check a result before you rely on it.",
  },
  {
    id: "field",
    code: "L.2",
    name: "Field guides",
    blurb:
      "Plain-language background on the work the tools support: reading a solicitation, pricing labor, protecting government information, getting paid.",
  },
  {
    id: "host",
    code: "L.3",
    name: "Host your own copy",
    blurb: "Run the site on your own server, your own cluster or a network with no internet connection.",
  },
  {
    id: "contribute",
    code: "L.4",
    name: "Contribute",
    blurb: "Ask for a tool, report a mistake, build a tool that can be listed or improve this site.",
  },
  {
    id: "reference",
    code: "L.5",
    name: "Reference",
    blurb: "Terms, sources and short answers to look up when you need them.",
  },
  {
    id: "project",
    code: "L.6",
    name: "How this project is run",
    blurb:
      "The 10-worker deterministic Prior Art engine, 14-state lifecycle, MIT clean-room architecture, and zero-AI-at-runtime rules.",
  },
  {
    id: "specs",
    code: "L.7",
    name: "Tool & platform specs",
    blurb: "Individual technical specifications for all 35 browser contracting, platform, and factory tools (CLIN 0001–0006).",
  },
] as const;

export type GuideGroup = (typeof guideGroups)[number];
export type GuideGroupId = GuideGroup["id"];

export type GuideMeta = {
  title: string;
  /** One sentence shown in the list and under the title. */
  summary: string;
  /** Which section of the guides page it belongs to. */
  group: GuideGroupId;
  /** Position within its section, lowest first. */
  order: number;
  /**
   * For guides that describe regulations: the month the facts were last
   * checked against the sources, as "YYYY-MM".
   */
  reviewed?: string;
  /** Month the guide was last revised, as "YYYY-MM". */
  revised?: string;
  /** Whether the guide describes intent/draft status rather than active operations. */
  draft?: boolean;
};

export type GuideHeading = { id: string; text: string };

export type Guide = GuideMeta & {
  slug: string;
  /** Section number, such as "L.2.3". */
  code: string;
  /** Reading time in minutes. */
  minutes: number;
  /** The second-level headings, for the table of contents. */
  headings: GuideHeading[];
};

type GuideModule = { default: ComponentType; meta: GuideMeta };

const guidesDir = path.join(process.cwd(), "src", "guides");
const wordsPerMinute = 220;

export function guideSlugs(): string[] {
  return readdirSync(guidesDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/** Reading time and headings come from the source text, not the compiled page. */
function readSource(slug: string): { minutes: number; headings: GuideHeading[] } {
  const source = readFileSync(path.join(guidesDir, `${slug}.mdx`), "utf8");
  const body = source.replace(/^export const meta = \{[\s\S]*?\n\};\n/, "");
  const prose = body.replace(/^```[\s\S]*?^```$/gm, "");

  const headings = [...prose.matchAll(/^## (.+)$/gm)].map(([, raw]) => {
    const text = raw
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[`*_]/g, "")
      .trim();
    return { id: slugify(text), text };
  });

  const words = body.split(/\s+/).filter((word) => /[A-Za-z0-9]/.test(word)).length;
  return { minutes: Math.max(1, Math.round(words / wordsPerMinute)), headings };
}

async function loadModule(slug: string): Promise<GuideModule> {
  const mod = (await import(`@/guides/${slug}.mdx`)) as GuideModule;
  const meta = mod.meta;
  if (!meta?.title || !meta.summary || typeof meta.order !== "number") {
    throw new Error(`src/guides/${slug}.mdx must export meta = { title, summary, group, order }`);
  }
  if (!guideGroups.some((group) => group.id === meta.group)) {
    const known = guideGroups.map((group) => `"${group.id}"`).join(", ");
    throw new Error(`src/guides/${slug}.mdx has group "${meta.group}". Use one of ${known}.`);
  }
  if (meta.reviewed && !/^\d{4}-(0[1-9]|1[0-2])$/.test(meta.reviewed)) {
    throw new Error(`src/guides/${slug}.mdx has reviewed "${meta.reviewed}". Write it as "YYYY-MM".`);
  }
  if (meta.revised && !/^\d{4}-(0[1-9]|1[0-2])$/.test(meta.revised)) {
    throw new Error(`src/guides/${slug}.mdx has revised "${meta.revised}". Write it as "YYYY-MM".`);
  }
  return mod;
}

let allGuides: Promise<Guide[]> | undefined;

/** Every guide, in reading order: by section, then by `order` within it. */
export function listGuides(): Promise<Guide[]> {
  allGuides ??= (async () => {
    const loaded = await Promise.all(
      guideSlugs().map(async (slug) => ({ slug, meta: (await loadModule(slug)).meta })),
    );
    return guideGroups.flatMap((group) =>
      loaded
        .filter(({ meta }) => meta.group === group.id)
        .sort((a, b) => a.meta.order - b.meta.order || a.slug.localeCompare(b.slug))
        .map(({ slug, meta }, index) => {
          const date = meta.revised ?? meta.reviewed;
          return {
            ...meta,
            reviewed: date,
            revised: date,
            slug,
            code: `${group.code}.${index + 1}`,
            ...readSource(slug),
          };
        }),
    );
  })();
  return allGuides;
}

export async function loadGuide(slug: string): Promise<{ guide: Guide; Content: ComponentType }> {
  const [mod, guides] = await Promise.all([loadModule(slug), listGuides()]);
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) throw new Error(`No guide named "${slug}" in src/guides.`);
  return { guide, Content: mod.default };
}

export function groupOf(guide: Pick<Guide, "group">): GuideGroup {
  return guideGroups.find((group) => group.id === guide.group)!;
}

/** "2026-11" becomes "November 2026". */
export function formatReviewed(reviewed: string): string {
  const [year, month] = reviewed.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
