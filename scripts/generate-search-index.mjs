import fs from "node:fs";
import path from "node:path";

// The same rule as src/lib/slug.ts, so links to sections land on the heading.
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[’'“”"`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const rootDir = process.cwd();
const dataDir = path.join(rootDir, "src", "data");
const outputFile = path.join(dataDir, "search-data.json");

const documents = [];

// 1. The top-level pages
documents.push({
  id: "page-home",
  type: "page",
  title: "ClearedStack Home",
  subtitle: "Free tools and guides for government contracting",
  summary: "Free, open-source browser tools and plain-language guides for pricing, proposals, cyber compliance and small business rules.",
  url: "/",
  badge: "Home",
  content: "ClearedStack Home free open source runs in your browser pricing proposals cyber compliance Section B supplies services prices CLIN 0001 0005 Section C statement of work Section F deliveries performance Section H special contract requirements Section L guides Section M"
});

documents.push({
  id: "page-tools",
  type: "page",
  title: "Tools",
  subtitle: "The catalog (CLIN 0001–0005)",
  summary: "Every tool, with what it does and the regulation it is built from.",
  url: "/tools/",
  badge: "Tools",
  content: "Tools catalog CLIN 0001 Pricing cost accounting CLIN 0002 Proposal capture CLIN 0003 Cybersecurity compliance CLIN 0004 Market research small business CLIN 0005 Tactical DevSecOps planned in development live"
});

documents.push({
  id: "page-guides",
  type: "page",
  title: "Guides",
  subtitle: "Section L: Instructions to offerors",
  summary: "Plain-language guides to the paperwork, to hosting a copy of the site and to contributing.",
  url: "/guides/",
  badge: "Guides",
  content: "Section L Instructions to offerors Start here Field guides Host your own copy Contribute Reference reading routes first bid"
});

documents.push({
  id: "page-platform",
  type: "page",
  title: "Platform",
  subtitle: "Section J: Attachments",
  summary: "How the project decides what to build, builds each tool from the public rule, and is designed to run.",
  url: "/platform/",
  badge: "Platform",
  content: "Platform Section J attachments pipeline ten workers cluster architecture public edits operations decisions status design built running components control plane cs-git cs-registry cs-runner cs-store hub-queue-api postgres"
});

documents.push({
  id: "page-status",
  type: "page",
  title: "Work log",
  subtitle: "What changed, newest first",
  summary: "What has changed on the project recently, one line per change.",
  url: "/status/",
  badge: "Status",
  content: "Work log status changes progress done in progress blocked planned updates history"
});

documents.push({
  id: "page-about",
  type: "page",
  title: "About ClearedStack",
  subtitle: "Mission, ground rules and disclaimer",
  summary: "Why ClearedStack exists, how the work is done, the ground rules and the full disclaimer.",
  url: "/about/",
  badge: "About",
  content: "Mission workplace autonomy builders not corporate overhead Ground rules No revenue No data collection Public sources only Show the work Legal disclaimer Independent personal project not DoD"
});

// 2. Tools from src/data/catalog.ts
const catalogSource = fs.readFileSync(path.join(dataDir, "catalog.ts"), "utf8");
const toolsMatch = catalogSource.match(/export const tools: (?:readonly )?Tool\[\] = (\[[\s\S]*?\n\]);/);
const categoriesMatch = catalogSource.match(/export const categories: (?:readonly )?Category\[\] = (\[[\s\S]*?\n\]);/);

const categoryMap = new Map();
if (categoriesMatch) {
  try {
    const categories = eval(categoriesMatch[1]);
    categories.forEach((c) => categoryMap.set(c.id, c));
  } catch (err) {
    console.error("Failed to parse categories:", err);
  }
}

if (toolsMatch) {
  try {
    const tools = eval(toolsMatch[1]);
    tools.forEach((t) => {
      const cat = categoryMap.get(t.category);
      const clin = cat ? `CLIN ${cat.clin}` : "CLIN";
      const catName = cat ? cat.name : t.category;

      let provenanceText = "";
      if (t.provenance) {
        if (t.provenance.inspiredBy && t.provenance.inspiredBy.length > 0) {
          provenanceText += " " + t.provenance.inspiredBy.map((i) => `${i.name} ${i.kind} ${i.url || ""}`).join(" ");
        }
        if (t.provenance.note) {
          provenanceText += " " + t.provenance.note;
        }
      }

      documents.push({
        id: `tool-${t.slug}`,
        type: "tool",
        title: t.name,
        subtitle: `${clin}: ${catName}`,
        summary: t.summary,
        url: `/tools/${t.slug}/`,
        badge: clin,
        status: t.status,
        content: `${t.name} ${t.summary} ${t.detail || ""} ${(t.inputs || []).join(" ")} ${(t.outputs || []).join(" ")} ${(t.sources || []).map((src) => src.name).join(" ")} ${clin} ${catName} ${t.status} ${cat?.blurb || ""}${provenanceText}`
      });
    });
  } catch (err) {
    console.error("Failed to parse tools:", err);
  }
}

// 3. Platform components from the naming registry. A component with a
// specification page is indexed from that page; the registry adds its old
// identifier, so a search for "cs-git" still finds Plainforge.
const registry = JSON.parse(fs.readFileSync(path.join(dataDir, "registry.json"), "utf8"));
const formerNames = new Map(registry.components.map((component) => [component.slug, component]));

registry.components.forEach((component) => {
  if (fs.existsSync(path.join(rootDir, "src", "platform", `${component.slug}.mdx`))) return;
  documents.push({
    id: `app-${component.slug}`,
    type: "app",
    title: component.name,
    subtitle: `Platform component · formerly ${component.formerly}`,
    summary: component.responsibility,
    url: "/platform/#registry",
    badge: "Platform",
    content: `${component.name} ${component.formerly} ${(component.earlierNames || []).join(" ")} ${component.namespace} ${component.responsibility} ${component.interfaces.join(" ")} ${component.subTools.join(" ")}`
  });
});

// 4. Guides (src/guides) and platform pages (src/platform), with their sections.
// The section numbers repeat the ones in src/lib/docs.ts.
const collections = [
  {
    folder: "guides",
    base: "/guides",
    label: "Guide",
    type: "guide",
    codes: { start: "L.1", field: "L.2", host: "L.3", contribute: "L.4", reference: "L.5" },
  },
  {
    folder: "platform",
    base: "/platform",
    label: "Platform",
    type: "guide",
    codes: { factory: "J.1", cluster: "J.2", governance: "J.3", components: "J.4" },
  },
  {
    // The specification shown on each tool's page. The tool itself is already
    // indexed from the catalog, so only the sections are added here.
    folder: "tools",
    base: "/tools",
    label: "Tool specification",
    type: "guide",
    codes: {},
    sectionsOnly: true,
  },
];

function plain(text) {
  return text
    .replace(/^```[\s\S]*?^```$/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*`_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const collection of collections) {
  const dir = path.join(rootDir, "src", collection.folder);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  files.forEach((f) => {
    const slug = f.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const metaMatch = raw.match(/export const meta = (\{[\s\S]*?\});/);
    const meta = metaMatch ? eval("(" + metaMatch[1] + ")") : {};
    const body = raw.replace(/^export const meta = \{[\s\S]*?\};\n/, "");
    const cleanBody = plain(body);
    const code = collection.codes[meta.group] || "";

    if (!collection.sectionsOnly) documents.push({
      id: `${collection.folder}-${slug}`,
      type: collection.type,
      title: meta.title || slug,
      subtitle: `${collection.label} · Section ${code}`,
      summary: meta.summary || cleanBody.slice(0, 160) + "...",
      url: `${collection.base}/${slug}/`,
      badge: meta.status ? meta.status.toUpperCase() : code,
      content: `${meta.title} ${meta.summary || ""} ${meta.group || ""} ${code} ${meta.status || ""} ${
        collection.folder === "platform" && formerNames.has(slug)
          ? `formerly ${formerNames.get(slug).formerly} ${(formerNames.get(slug).earlierNames || []).join(" ")} ${formerNames.get(slug).responsibility}`
          : ""
      } ${cleanBody.slice(0, 600)}`
    });

    const parts = body.split(/^## /m);
    for (let i = 1; i < parts.length; i++) {
      const firstLineEnd = parts[i].indexOf("\n");
      const heading = parts[i].slice(0, firstLineEnd).trim().replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[`*_]/g, "");
      if (["sources", "related pages"].includes(heading.toLowerCase())) continue;
      const anchor = slugify(heading);
      const sectionText = plain(parts[i].slice(firstLineEnd));
      const snippet = sectionText.slice(0, 160) + (sectionText.length > 160 ? "..." : "");
      documents.push({
        id: `section-${collection.folder}-${slug}-${anchor}`,
        type: "section",
        title: heading,
        subtitle: `${meta.title || slug}`,
        summary: snippet,
        url: `${collection.base}/${slug}/#${anchor}`,
        badge: "Section",
        content: `${heading} ${meta.title || ""} ${sectionText}`
      });
    }
  });
}

fs.writeFileSync(outputFile, JSON.stringify(documents, null, 2), "utf8");
console.log(`Generated ${documents.length} search records in ${outputFile}`);
