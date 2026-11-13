import fs from "node:fs";
import path from "node:path";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const rootDir = process.cwd();
const guidesDir = path.join(rootDir, "src", "guides");
const dataDir = path.join(rootDir, "src", "data");
const outputFile = path.join(dataDir, "search-data.json");

const documents = [];

// 1. Core Pages
documents.push({
  id: "page-home",
  type: "page",
  title: "ClearedStack Home",
  subtitle: "Federal Contracting Tools Hub",
  summary: "Free, open-source, browser-based tools for government contracting: pricing, proposals and cyber compliance.",
  url: "/",
  badge: "Home",
  content: "ClearedStack Home free open source runs in your browser pricing proposals cyber compliance Section B supplies services prices Section C statement of work Section F deliveries performance Section H special contract requirements"
});

documents.push({
  id: "page-tools",
  type: "page",
  title: "Tool Catalog",
  subtitle: "Contract Line Items (CLIN 0001–0005)",
  summary: "Catalog of 18 planned tools across pricing, proposals, cybersecurity compliance, market research, and DevSecOps.",
  url: "/tools/",
  badge: "Catalog",
  content: "Tools catalog CLIN 0001 Pricing cost accounting CLIN 0002 Proposal capture CLIN 0003 Cybersecurity compliance CLIN 0004 Market research small business CLIN 0005 Tactical DevSecOps filter search planned live building"
});

documents.push({
  id: "page-guides",
  type: "page",
  title: "Guides Library",
  subtitle: "Section L: Instructions to Offerors",
  summary: "Comprehensive library of field guides, hosting manuals, contracting primers, and reference documents.",
  url: "/guides/",
  badge: "Guides",
  content: "Section L Instructions to offerors Start here Field guides Host your own copy Contribute Reference Reading routes Short answers"
});

documents.push({
  id: "page-about",
  type: "page",
  title: "About ClearedStack",
  subtitle: "Mission, Architecture & Disclaimers",
  summary: "Why ClearedStack exists, how the project is run, client-side guarantees, and the legal disclaimer.",
  url: "/about/",
  badge: "About",
  content: "Mission Ground rules No revenue No data collection Public sources only Show the work Legal disclaimer Independent personal project not DoD"
});

// 2. Tools from src/data/catalog.ts
const catalogSource = fs.readFileSync(path.join(dataDir, "catalog.ts"), "utf8");
const toolsMatch = catalogSource.match(/export const tools: readonly Tool\[\] = (\[[\s\S]*?\n\]);/);
const categoriesMatch = catalogSource.match(/export const categories: readonly Category\[\] = (\[[\s\S]*?\n\]);/);

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
      documents.push({
        id: `tool-${t.slug}`,
        type: "tool",
        title: t.name,
        subtitle: `${clin}: ${catName}`,
        summary: t.summary,
        url: `/tools/#${t.category}`,
        badge: clin,
        status: t.status,
        content: `${t.name} ${t.summary} ${clin} ${catName} ${t.status} ${cat?.blurb || ""}`
      });
    });
  } catch (err) {
    console.error("Failed to parse tools:", err);
  }
}

// 3. Guides and Subsections from src/guides/*.mdx
const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".mdx"));

files.forEach((f) => {
  const slug = f.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(guidesDir, f), "utf8");
  const metaMatch = raw.match(/export const meta = (\{[\s\S]*?\});/);
  const meta = metaMatch ? eval("(" + metaMatch[1] + ")") : {};
  const body = raw.replace(/^export const meta = \{[\s\S]*?\};\n/, "");

  // Clean whole body text
  const cleanBody = body
    .replace(/^```[\s\S]*?^```$/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*`_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Primary Guide document
  documents.push({
    id: `guide-${slug}`,
    type: "guide",
    title: meta.title || slug,
    subtitle: `Guide · Section ${meta.group ? meta.group.toUpperCase() : "L"}`,
    summary: meta.summary || cleanBody.slice(0, 160) + "...",
    url: `/guides/${slug}/`,
    badge: meta.group ? meta.group.toUpperCase() : "GUIDE",
    content: `${meta.title} ${meta.summary || ""} ${meta.group || ""} ${cleanBody.slice(0, 500)}`
  });

  // Split into heading sections
  const parts = body.split(/^## /m);
  for (let i = 1; i < parts.length; i++) {
    const firstLineEnd = parts[i].indexOf("\n");
    const heading = parts[i].slice(0, firstLineEnd).trim().replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[`*_]/g, "");
    if (heading.toLowerCase() === "sources") continue;
    const anchor = slugify(heading);
    const sectionText = parts[i]
      .slice(firstLineEnd)
      .trim()
      .replace(/^```[\s\S]*?^```$/gm, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[#*`_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const snippet = sectionText.slice(0, 160) + (sectionText.length > 160 ? "..." : "");
    documents.push({
      id: `section-${slug}-${anchor}`,
      type: "section",
      title: heading,
      subtitle: `${meta.title || slug}`,
      summary: snippet,
      url: `/guides/${slug}/#${anchor}`,
      badge: "Section",
      content: `${heading} ${meta.title || ""} ${sectionText}`
    });
  }
});

fs.writeFileSync(outputFile, JSON.stringify(documents, null, 2), "utf8");
console.log(`Generated ${documents.length} search records in ${outputFile}`);
