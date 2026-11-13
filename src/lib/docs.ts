import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";
import { components } from "@/data/platform";
import { slugify } from "@/lib/slug";
import type { DocStatus } from "@/lib/status";

/**
 * The site has two libraries of .mdx pages:
 *
 *   src/guides    →  /guides/<name>/     for people doing contracting work
 *   src/platform  →  /platform/<name>/   how the project chooses, builds and
 *                                        runs things
 *
 * and one folder of specifications that are shown on the tool pages:
 *
 *   src/tools     →  /tools/<slug>/      the detailed specification of a tool,
 *                                        named after its slug in the catalog
 *
 * Each file exports a `meta` object and its content. To add a page, add a
 * file to one of those folders; the index page, the table of contents, the
 * previous/next links, the search index and the sitemap pick it up.
 */

export type DocGroup = {
  id: string;
  /** Section number shown beside the name, such as "L.2". */
  code: string;
  name: string;
  blurb: string;
};

export type DocMeta = {
  title: string;
  /** One sentence shown in the list and under the title. */
  summary: string;
  /** Which section of its index page it belongs to. */
  group: string;
  /** Position within its section, lowest first. */
  order: number;
  /**
   * For guides that describe regulations: the month the facts were last
   * checked against the sources, as "YYYY-MM".
   */
  reviewed?: string;
  /** Month the page was last revised, as "YYYY-MM". */
  revised?: string;
  /** Platform pages only: whether this is a design, built or running. */
  status?: DocStatus;
};

export type DocHeading = { id: string; text: string };

export type Doc = DocMeta & {
  slug: string;
  /** Where the page is served, such as "/guides/labor-rates/". */
  href: string;
  /** Section number, such as "L.2.3". */
  code: string;
  /** Reading time in minutes. */
  minutes: number;
  /** The second-level headings, for the table of contents. */
  headings: DocHeading[];
};

type DocModule = { default: ComponentType; meta: DocMeta };

const wordsPerMinute = 220;
const month = /^\d{4}-(0[1-9]|1[0-2])$/;
const statuses: DocStatus[] = ["design", "built", "running"];

/** Reading time and headings come from the source text, not the compiled page. */
function readSource(file: string): { minutes: number; headings: DocHeading[] } {
  const source = readFileSync(file, "utf8");
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

function createCollection<const Groups extends readonly DocGroup[]>(options: {
  /** Folder under src/ that holds the .mdx files. */
  folder: string;
  /** Address prefix, such as "/guides". */
  base: string;
  groups: Groups;
  /** The import has to be written out per folder so the bundler can follow it. */
  importer: (slug: string) => Promise<unknown>;
}) {
  const { folder, base, groups, importer } = options;
  const dir = path.join(process.cwd(), "src", folder);
  const where = (slug: string) => `src/${folder}/${slug}.mdx`;

  function slugs(): string[] {
    return readdirSync(dir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""));
  }

  async function loadModule(slug: string): Promise<DocModule> {
    const mod = (await importer(slug)) as DocModule;
    const meta = mod.meta;
    if (!meta?.title || !meta.summary || typeof meta.order !== "number") {
      throw new Error(`${where(slug)} must export meta = { title, summary, group, order }`);
    }
    if (!groups.some((group) => group.id === meta.group)) {
      const known = groups.map((group) => `"${group.id}"`).join(", ");
      throw new Error(`${where(slug)} has group "${meta.group}". Use one of ${known}.`);
    }
    for (const field of ["reviewed", "revised"] as const) {
      const value = meta[field];
      if (value && !month.test(value)) {
        throw new Error(`${where(slug)} has ${field} "${value}". Write it as "YYYY-MM".`);
      }
    }
    if (meta.status && !statuses.includes(meta.status)) {
      throw new Error(`${where(slug)} has status "${meta.status}". Use one of ${statuses.join(", ")}.`);
    }
    return mod;
  }

  let all: Promise<Doc[]> | undefined;

  /** Every page, in reading order: by section, then by `order` within it. */
  function list(): Promise<Doc[]> {
    all ??= (async () => {
      const loaded = await Promise.all(
        slugs().map(async (slug) => ({ slug, meta: (await loadModule(slug)).meta })),
      );
      return groups.flatMap((group) =>
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
              href: `${base}/${slug}/`,
              code: `${group.code}.${index + 1}`,
              ...readSource(path.join(dir, `${slug}.mdx`)),
            };
          }),
      );
    })();
    return all;
  }

  async function load(slug: string): Promise<{ doc: Doc; Content: ComponentType }> {
    const [mod, docs] = await Promise.all([loadModule(slug), list()]);
    const doc = docs.find((item) => item.slug === slug);
    if (!doc) throw new Error(`No page named "${slug}" in src/${folder}.`);
    return { doc, Content: mod.default };
  }

  function groupOf(doc: Pick<Doc, "group">): Groups[number] {
    return groups.find((group) => group.id === doc.group)!;
  }

  return { folder, base, groups, slugs, list, load, groupOf };
}

/**
 * The guides. The numbering follows Section L of a solicitation
 * ("Instructions to offerors"), the way the home page borrows Sections B, C,
 * F and H.
 */
export const guides = createCollection({
  folder: "guides",
  base: "/guides",
  importer: (slug) => import(`@/guides/${slug}.mdx`),
  groups: [
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
      blurb: "Terms and sources to look up when you need them.",
    },
  ],
});

/**
 * The platform pages. Section J of a solicitation is the list of attachments,
 * which is where the technical specifications usually live.
 */
export const platform = createCollection({
  folder: "platform",
  base: "/platform",
  importer: (slug) => import(`@/platform/${slug}.mdx`),
  groups: [
    {
      id: "factory",
      code: "J.1",
      name: "How tools get made",
      blurb: "The pipeline that finds an idea, scores it, credits it and builds it from the public rule.",
    },
    {
      id: "cluster",
      code: "J.2",
      name: "What it runs on",
      blurb: "The cluster the pipeline is designed to run on, how the public proposes changes and how it is operated.",
    },
    {
      id: "governance",
      code: "J.3",
      name: "How it is governed",
      blurb: "What has been decided, what is still open and how AI is used in the work.",
    },
    {
      id: "components",
      code: "J.4",
      name: "Component specifications",
      blurb: "One specification for each control-plane service and each pipeline worker: its job, its interfaces and how it fails.",
    },
  ],
});

/**
 * The detailed specification of a tool, if one has been written. The file is
 * src/tools/<slug>.mdx, where <slug> is the tool's slug in the catalog.
 */
const toolSpecDir = path.join(process.cwd(), "src", "tools");

export function toolSpecSlugs(): string[] {
  return readdirSync(toolSpecDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function loadToolSpec(
  slug: string,
): Promise<{ Content: ComponentType; headings: DocHeading[]; minutes: number; revised?: string } | undefined> {
  const file = path.join(toolSpecDir, `${slug}.mdx`);
  if (!existsSync(file)) return undefined;
  const mod = (await import(`@/tools/${slug}.mdx`)) as { default: ComponentType; meta?: { revised?: string } };
  return { Content: mod.default, revised: mod.meta?.revised, ...readSource(file) };
}

export type Collection = typeof guides | typeof platform;

/**
 * Guides that used to live under /guides/ and are now platform pages. The old
 * address still answers, with a page that sends the reader on. A static site
 * cannot issue a redirect, so this is the next best thing.
 *
 * Specifications were once guides named "spec-<name>", using each component's
 * old identifier. Those addresses are worked out from the naming registry by
 * movedGuideTarget() below and do not need listing here.
 */
export const movedGuides: Record<string, string> = {
  "self-building-factory-loop": "/platform/overview/",
  "prior-art-engine": "/platform/pipeline/",
  "find-candidates": "/platform/pipeline/",
  "observe-a-tool": "/platform/pipeline/",
  "worker-09-monitor-and-10-notify": "/platform/pipeline/",
  "deterministic-sub-tools": "/platform/pipeline/",
  "shared-contracts-and-sdk": "/platform/pipeline/",
  "workflow-state-machine": "/platform/item-lifecycle/",
  "score-and-decide": "/platform/how-we-decide/",
  "credit-and-clean-room": "/platform/clean-room-and-credit/",
  "mit-clean-room-architecture": "/platform/clean-room-and-credit/",
  "one-command-quickstart": "/platform/cluster-architecture/",
  "two-namespace-topology": "/platform/cluster-architecture/",
  "cs-git-and-github-mirror": "/platform/cluster-architecture/",
  "cs-runner-and-cs-store": "/platform/cluster-architecture/",
  "cs-registry-and-no-docker": "/platform/cluster-architecture/",
  "central-database-and-spool": "/platform/cluster-architecture/",
  "anonymous-edits-and-anti-spam": "/platform/public-edits/",
  "ownership-map-and-edit-loop": "/platform/public-edits/",
  "open-public-sandbox": "/platform/public-edits/",
  "network-privacy-and-public-logic": "/platform/public-edits/",
  "live-command-portal": "/platform/operations/",
  "software-decides-ui": "/platform/operations/",
  "when-a-worker-is-red": "/platform/operations/",
  "backups-and-restore-drills": "/platform/operations/",
  "open-questions": "/platform/decisions/",
  "architecture-council-decisions": "/platform/decisions/",
  "built-with-ai": "/platform/built-with-ai/",
};

/** Every old /guides/<slug>/ address that should send the reader somewhere else. */
export function movedGuideSlugs(): string[] {
  return [
    ...Object.keys(movedGuides),
    ...toolSpecSlugs().map((slug) => `spec-${slug}`),
    ...components.map((component) => `spec-${component.formerly}`),
  ];
}

/** Where an old guide address now leads, or undefined if it never moved. */
export function movedGuideTarget(slug: string): string | undefined {
  if (movedGuides[slug]) return movedGuides[slug];
  if (!slug.startsWith("spec-")) return undefined;
  const name = slug.slice("spec-".length);
  if (toolSpecSlugs().includes(name)) return `/tools/${name}/`;
  const component = components.find((item) => item.formerly === name);
  return component ? `/platform/${component.slug}/` : undefined;
}

/**
 * Platform pages named after a component's old identifier or an earlier name,
 * such as /platform/cs-registry/ or /platform/stow/. They send the reader to
 * the page under its current name.
 */
export function movedPlatformSlugs(): string[] {
  return components.flatMap(oldPlatformSlugs);
}

export function movedPlatformTarget(slug: string): string | undefined {
  const component = components.find((item) => oldPlatformSlugs(item).includes(slug));
  return component ? `/platform/${component.slug}/` : undefined;
}

/** A component's old identifier and the lowercase form of any earlier name. */
function oldPlatformSlugs(component: (typeof components)[number]): string[] {
  return [component.formerly, ...(component.earlierNames ?? []).map((name) => name.toLowerCase())];
}

/** "2026-11" becomes "November 2026". */
export function formatMonth(value: string): string {
  const [year, monthNumber] = value.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
