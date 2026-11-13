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

// 1. Core & Interactive Factory Pages
documents.push({
  id: "page-home",
  type: "page",
  title: "ClearedStack Home",
  subtitle: "Federal Contracting Tools & Deterministic Factory",
  summary: "Free, open-source browser tools and 100% deterministic software factory for pricing, proposals, and cyber compliance.",
  url: "/",
  badge: "Home",
  content: "ClearedStack Home free open source runs in your browser pricing proposals cyber compliance Section B supplies services prices CLIN 0001 0006 Section C statement of work Section F deliveries performance Section H special contract requirements Section M"
});

documents.push({
  id: "page-tools",
  type: "page",
  title: "Tools & Platform Apps",
  subtitle: "Contract Line Items (CLIN 0001–0006)",
  summary: "Unified catalog of 18 browser contracting utilities and all 17 MIT platform microservices and deterministic factory workers.",
  url: "/tools/",
  badge: "Catalog",
  content: "Tools and Apps catalog CLIN 0001 Pricing cost accounting CLIN 0002 Proposal capture CLIN 0003 Cybersecurity compliance CLIN 0004 Market research small business CLIN 0005 Tactical DevSecOps CLIN 0006 Platform Factory Apps cs-git cs-registry cs-runner cs-store workers"
});

documents.push({
  id: "page-guides",
  type: "page",
  title: "Guides & Live Factory",
  subtitle: "Section L: Instructions, Manuals & Live Views",
  summary: "Hub for live factory views (Command, Apps, Pipeline, Decide, Section M), contracting field guides, and self-hosting manuals.",
  url: "/guides/",
  badge: "Guides",
  content: "Section L Instructions to offerors Start here Field guides Host your own copy Contribute Reference How this project is run Command Apps Pipeline Decide Reading routes Short answers"
});

documents.push({
  id: "page-guides-command",
  type: "page",
  title: "Command Portal",
  subtitle: "Guides · Live Operational View",
  summary: "Deterministic P0–P2 attention feed, sanitized error codes, 10-worker pulse strip, and 7 control-plane microservices.",
  url: "/guides/command/",
  badge: "Command",
  content: "Command Portal open public sandbox no login lock P0 active errors P1 queue sub-tools P2 decisions edits View = f(state) deterministic attention rules clearedstack cs-workers"
});

documents.push({
  id: "page-guides-apps",
  type: "page",
  title: "Cluster App Store",
  subtitle: "Guides · cs-store Server-Side Apply",
  summary: "Live App Store view of all 7 control-plane microservices and 10 deterministic workers managed by cs-store.",
  url: "/guides/apps/",
  badge: "Apps",
  content: "Apps Cluster App Store cs-store Server-Side Apply 7 control-plane pods 10 workers 5 digests cs-registry ko rootless BuildKit Owner Mode Upgrade Pause Rollback"
});

documents.push({
  id: "page-guides-pipeline",
  type: "page",
  title: "10-Worker Pipeline",
  subtitle: "Guides · cs-01-intake through cs-10-notify",
  summary: "Live 100% deterministic pipeline across ten worker repositories, PA-XXXX item trails, local spools, and tools/<case>/ sub-tools.",
  url: "/guides/pipeline/",
  badge: "Pipeline",
  content: "10-Worker Pipeline deterministic zero AI at runtime urgent normal backfill needs_subtool /var/spool/cs PA-XXXX cs-01-intake cs-02-observe cs-03-evaluate cs-04-decide cs-05-provenance cs-06-build cs-07-verify cs-08-catalog cs-09-monitor cs-10-notify"
});

documents.push({
  id: "page-guides-decide",
  type: "page",
  title: "Decisions & Public Edits",
  subtitle: "Guides · cs-04-decide Queue",
  summary: "Publicly visible queue for candidate tool determinations and anonymous ✎ Edit proposals routed via ownership_map.json.",
  url: "/guides/decide/",
  badge: "Decide",
  content: "Decisions and Public Edit Proposals cs-04-decide core.edit_proposal anonymous edits 5-layer anti-spam proof-of-work honeypot ownership_map.json cs-git GitHub mirror"
});

documents.push({
  id: "page-how-we-decide",
  type: "page",
  title: "How We Decide",
  subtitle: "Guides · Section M Evaluation Factors",
  summary: "Evaluation factors, 5 binary knockout gates, 100-point scoring rubric, 14-state record lifecycle, and clean-room provenance rules.",
  url: "/guides/how-we-decide/",
  badge: "Section M",
  content: "Section M evaluation factors how we decide prior art engine ten workers five knockout gates 100-point scoring rubric outcomes Build Link Merge Park Reject 14 record states clean room AI disclosure Claude Code Antigravity review accountability"
});

documents.push({
  id: "page-about",
  type: "page",
  title: "About ClearedStack",
  subtitle: "Mission, Workplace Autonomy & Disclaimers",
  summary: "Why ClearedStack exists, builder autonomy, how the 11-repo deterministic factory is run, and the legal disclaimer.",
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
        url: `/tools/#${t.category}`,
        badge: clin,
        status: t.status,
        content: `${t.name} ${t.summary} ${clin} ${catName} ${t.status} ${cat?.blurb || ""}${provenanceText}`
      });
    });
  } catch (err) {
    console.error("Failed to parse tools:", err);
  }
}

// 3. Platform & Factory Apps from src/data/platform.ts
const platformSource = fs.readFileSync(path.join(dataDir, "platform.ts"), "utf8");
const cpMatch = platformSource.match(/export const controlPlaneApps: PlatformApp\[\] = (\[[\s\S]*?\n\]);/);
const wkMatch = platformSource.match(/export const workerApps: PlatformApp\[\] = (\[[\s\S]*?\n\]);/);

for (const match of [cpMatch, wkMatch]) {
  if (!match) continue;
  try {
    const apps = eval(match[1]);
    apps.forEach((app) => {
      const kindLabel = app.kind === "control-plane" ? "Control Plane" : "Deterministic Worker";
      documents.push({
        id: `app-${app.id}`,
        type: "app",
        title: app.name,
        subtitle: `CLIN 0006 · ${kindLabel} (${app.namespace})`,
        summary: app.role,
        url: `/tools/#app-${app.id}`,
        badge: app.ramBudget,
        status: app.health,
        content: `${app.name} ${app.namespace} ${app.role} ${app.ownerRepo} ${app.ramBudget} ${app.version} ${app.notes} ${(app.subTools || []).join(" ")}`
      });
    });
  } catch (err) {
    console.error("Failed to parse platform apps:", err);
  }
}

// 4. Guides and Subsections from src/guides/*.mdx
const groupCodeMap = {
  start: "L.1",
  field: "L.2",
  host: "L.3",
  contribute: "L.4",
  reference: "L.5",
  project: "L.6",
};

const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".mdx"));

files.forEach((f) => {
  const slug = f.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(guidesDir, f), "utf8");
  const metaMatch = raw.match(/export const meta = (\{[\s\S]*?\});/);
  const meta = metaMatch ? eval("(" + metaMatch[1] + ")") : {};
  const body = raw.replace(/^export const meta = \{[\s\S]*?\};\n/, "");

  const cleanBody = body
    .replace(/^```[\s\S]*?^```$/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*`_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const groupLabel = groupCodeMap[meta.group] || "L";
  const badgeLabel = meta.draft ? "DRAFT" : groupLabel;

  documents.push({
    id: `guide-${slug}`,
    type: "guide",
    title: meta.title || slug,
    subtitle: `Guide · Section ${groupLabel}`,
    summary: meta.summary || cleanBody.slice(0, 160) + "...",
    url: `/guides/${slug}/`,
    badge: badgeLabel,
    content: `${meta.title} ${meta.summary || ""} ${meta.group || ""} ${groupLabel} ${meta.draft ? "draft intent" : ""} ${cleanBody.slice(0, 600)}`
  });

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
