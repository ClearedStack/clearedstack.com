// Writes the files that let an AI agent, a crawler or a script read the whole
// site without parsing HTML. Run before every build (see package.json).
//
//   public/llms.txt          an index of every page, one line each (llmstxt.org)
//   public/llms-full.txt     every page's text in one file
//   public/pages.json        every page as data: address, title, summary, status
//   public/status.json       the work log (src/data/status.jsonl) as JSON
//   public/<section>/<slug>.md   a Markdown copy of each guide, platform page
//                            and tool, next to its HTML address
//
// All of these are generated. They are listed in .gitignore and must not be
// edited by hand: change the source file in src/ instead.
//
// The script also checks the content. It stops the build with a message if a
// page is missing its details or a work-log line is malformed, and prints a
// warning for smaller problems such as em dashes.

import fs from "node:fs";
import path from "node:path";

import { loadCatalog } from "./load-catalog.mjs";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const dataDir = path.join(srcDir, "data");
const publicDir = path.join(rootDir, "public");

const siteSource = fs.readFileSync(path.join(dataDir, "site.ts"), "utf8");
const siteUrl = siteSource.match(/url: "([^"]+)"/)?.[1] ?? "https://clearedstack.com";
const siteDescription = siteSource.match(/description:\s*"([^"]+)"/)?.[1] ?? "";

const errors = [];
const warnings = [];

// ---------------------------------------------------------------------------
// Read the content

const collections = [
  {
    folder: "guides",
    label: "Guides",
    blurb: "Plain-language guides to the paperwork of government contracting, hosting a copy of the site and contributing.",
    groups: ["start", "field", "host", "contribute", "reference"],
  },
  {
    folder: "platform",
    label: "Platform",
    blurb: "How the project decides what to build, builds each tool from the public rule, and is designed to run.",
    groups: ["factory", "cluster", "governance", "components"],
  },
];

const month = /^\d{4}-(0[1-9]|1[0-2])$/;
const statuses = ["design", "built", "running"];

function readMdx(file) {
  const raw = fs.readFileSync(file, "utf8");
  const metaMatch = raw.match(/^export const meta = (\{[\s\S]*?\n\});\n/);
  let meta = {};
  if (metaMatch) {
    try {
      meta = eval("(" + metaMatch[1] + ")");
    } catch (err) {
      errors.push(`${rel(file)}: could not read meta (${err.message})`);
    }
  }
  const body = raw.replace(/^export const meta = \{[\s\S]*?\n\};\n/, "").trim();
  return { raw, meta, body, hasMeta: Boolean(metaMatch) };
}

function rel(file) {
  return path.relative(rootDir, file);
}

// U+2014, written as a code so this file has none of its own.
const emDash = String.fromCharCode(0x2014);
const emDashes = [];
function emDashCheck(file, text) {
  const count = text.split(emDash).length - 1;
  if (count > 0) emDashes.push(`${rel(file)} (${count})`);
}

const pages = [];

// Top-level pages are written in TSX, so their summaries are kept here.
const corePages = [
  { url: "/", title: "Home", summary: "What ClearedStack is: free, open-source browser tools and plain-language guides for government contracting." },
  { url: "/tools/", title: "Tools", summary: "The catalog of tools, with what each does, its status and the public rule it is built from." },
  { url: "/guides/", title: "Guides", summary: "Every guide, in five groups, with suggested reading routes." },
  { url: "/platform/", title: "Platform", summary: "How the project decides, builds and runs, the status labels and the naming registry of every component." },
  { url: "/status/", title: "Work log", summary: "What has changed on the project recently, one line per change, newest first." },
  { url: "/about/", title: "About", summary: "Why the project exists, how the work is done, the ground rules and the full disclaimer." },
];
for (const page of corePages) pages.push({ ...page, type: "page", section: "Site" });

for (const collection of collections) {
  const dir = path.join(srcDir, collection.folder);
  for (const fileName of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort()) {
    const file = path.join(dir, fileName);
    const slug = fileName.replace(/\.mdx$/, "");
    const { meta, body, raw, hasMeta } = readMdx(file);
    emDashCheck(file, raw);

    if (!hasMeta) errors.push(`${rel(file)}: must start with export const meta = { ... };`);
    for (const field of ["title", "summary", "group"]) {
      if (!meta[field]) errors.push(`${rel(file)}: meta.${field} is missing`);
    }
    if (typeof meta.order !== "number") errors.push(`${rel(file)}: meta.order must be a number`);
    if (meta.group && !collection.groups.includes(meta.group)) {
      errors.push(`${rel(file)}: meta.group "${meta.group}" is not one of ${collection.groups.join(", ")}`);
    }
    for (const field of ["reviewed", "revised"]) {
      if (meta[field] && !month.test(meta[field])) errors.push(`${rel(file)}: meta.${field} must be "YYYY-MM"`);
    }
    if (meta.status && !statuses.includes(meta.status)) {
      errors.push(`${rel(file)}: meta.status must be one of ${statuses.join(", ")}`);
    }
    if (collection.folder === "platform" && !meta.status) {
      warnings.push(`${rel(file)}: platform page has no meta.status (design, built or running)`);
    }
    if (meta.summary && meta.summary.length > 240) {
      warnings.push(`${rel(file)}: meta.summary is ${meta.summary.length} characters; keep it to one sentence`);
    }

    pages.push({
      url: `/${collection.folder}/${slug}/`,
      markdown: `/${collection.folder}/${slug}.md`,
      title: meta.title ?? slug,
      summary: meta.summary ?? "",
      type: collection.folder === "guides" ? "guide" : "platform",
      section: collection.label,
      group: meta.group,
      order: meta.order,
      status: meta.status,
      revised: meta.revised ?? meta.reviewed,
      source: rel(file),
      body,
    });
  }
}

// Tools: the catalog entry, followed by the tool's specification if it has one.
// Read and merged by scripts/load-catalog.mjs; a bad catalog/tools.json stops here.
const { source: catalogSource, toolsFound, tools, categories: categoryList } = loadCatalog(rootDir);
const categories = new Map(categoryList.map((c) => [c.id, c]));
if (!toolsFound) errors.push("src/data/catalog.ts: could not find `const catalogTools: Tool[] = [...]`");
emDashCheck(path.join(dataDir, "catalog.ts"), catalogSource);

for (const tool of tools) {
  const category = categories.get(tool.category);
  const specFile = path.join(srcDir, "tools", `${tool.slug}.mdx`);
  const spec = fs.existsSync(specFile) ? readMdx(specFile) : undefined;
  if (spec) emDashCheck(specFile, spec.raw);

  const lines = [];
  if (tool.detail) lines.push(tool.detail, "");
  const list = (heading, items) => {
    if (!items?.length) return;
    lines.push(`## ${heading}`, "", ...items.map((item) => `- ${item}`), "");
  };
  list("What you bring", tool.inputs);
  list("What you leave with", tool.outputs);
  list(
    "Built from",
    tool.sources?.map((source) => (source.url ? `[${source.name}](${source.url})` : source.name)),
  );
  if (tool.url) lines.push(`Use it: ${tool.url}`, "");
  if (tool.repo) lines.push(`Source: ${tool.repo}`, "");
  if (spec) lines.push("## Specification", "", spec.body.replace(/^## /gm, "### "));

  pages.push({
    url: `/tools/${tool.slug}/`,
    markdown: `/tools/${tool.slug}.md`,
    title: tool.name,
    summary: tool.summary,
    type: "tool",
    section: "Tools",
    group: tool.category,
    category: category?.name,
    toolStatus: tool.status,
    revised: spec?.meta?.revised,
    source: spec ? `src/data/catalog.ts, ${rel(specFile)}` : "src/data/catalog.ts",
    body: lines.join("\n").trim(),
  });
}

// ---------------------------------------------------------------------------
// The work log: one JSON object per line, appended to by people and agents.

const logStates = ["done", "in-progress", "blocked", "planned"];
const logFile = path.join(dataDir, "status.jsonl");
const log = [];
if (fs.existsSync(logFile)) {
  fs.readFileSync(logFile, "utf8")
    .split("\n")
    .forEach((line, index) => {
      if (!line.trim()) return;
      const where = `src/data/status.jsonl line ${index + 1}`;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        errors.push(`${where}: not valid JSON`);
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? "")) errors.push(`${where}: date must be "YYYY-MM-DD"`);
      if (!entry.area || !/^[a-z0-9-]+$/.test(entry.area)) errors.push(`${where}: area must be a lowercase slug`);
      if (!logStates.includes(entry.state)) errors.push(`${where}: state must be one of ${logStates.join(", ")}`);
      if (!entry.summary) errors.push(`${where}: summary is missing`);
      if ((entry.summary ?? "").length > 240) errors.push(`${where}: summary is over 240 characters`);
      if (line.includes(emDash)) errors.push(`${where}: contains an em dash`);
      if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(line)) errors.push(`${where}: contains an email address`);
      if (/\b\d{1,3}(\.\d{1,3}){3}\b/.test(line)) errors.push(`${where}: contains an IP address`);
      if (/\.(local|internal|lan)\b|svc\.cluster/.test(line)) errors.push(`${where}: contains an internal hostname`);
      log.push(entry);
    });
}

// ---------------------------------------------------------------------------
// Stop on errors

if (emDashes.length) {
  warnings.push(`em dashes in ${emDashes.length} files; use a comma, colon or new sentence instead: ${emDashes.join(", ")}`);
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\n${errors.length} problem${errors.length === 1 ? "" : "s"} must be fixed before the site can build.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Write

const abs = (url) => `${siteUrl}${url}`;

function header(page) {
  const facts = [
    `Address: ${abs(page.url)}`,
    page.status ? `Status: ${page.status}` : undefined,
    page.toolStatus ? `Tool status: ${page.toolStatus}` : undefined,
    page.category ? `Category: ${page.category}` : undefined,
    page.revised ? `Revised: ${page.revised}` : undefined,
    page.source ? `Source: ${page.source}` : undefined,
  ].filter(Boolean);
  return [`# ${page.title}`, "", `> ${page.summary}`, "", ...facts].join("\n");
}

function markdownOf(page) {
  return `${header(page)}\n\n${page.body}\n`;
}

// Clear the generated Markdown from an earlier run, so a deleted page leaves nothing behind.
for (const folder of ["guides", "platform", "tools"]) {
  const dir = path.join(publicDir, folder);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) if (file.endsWith(".md")) fs.rmSync(path.join(dir, file));
}

const withBody = pages.filter((page) => page.markdown);
for (const page of withBody) {
  const file = path.join(publicDir, page.markdown);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, markdownOf(page), "utf8");
}

const sectionOrder = ["Site", "Tools", "Guides", "Platform"];
const sectionBlurb = {
  Site: "The top-level pages.",
  Tools: "One page per tool. A tool is only usable once its status is live.",
  ...Object.fromEntries(collections.map((c) => [c.label, c.blurb])),
};

const llms = [
  "# ClearedStack",
  "",
  `> ${siteDescription}`,
  "",
  "Every page below links to a Markdown copy; drop the `.md` for the HTML page. Platform pages carry a status: design (a specification), built (code exists and passes its tests) or running (deployed). Nothing on this site is legal, accounting or compliance advice.",
  "",
  "To change the site, read AGENTS.md in the repository. Content lives in src/guides, src/platform and src/tools as one .mdx file per page; data lives in src/data.",
  "",
];
for (const section of sectionOrder) {
  const items = pages.filter((page) => page.section === section);
  if (!items.length) continue;
  llms.push(`## ${section}`, "", sectionBlurb[section] ?? "", "");
  for (const page of items) {
    const label = page.status ?? page.toolStatus;
    llms.push(`- [${page.title}](${abs(page.markdown ?? page.url)}): ${page.summary}${label ? ` (${label})` : ""}`);
  }
  llms.push("");
}
llms.push(
  "## Data",
  "",
  `- [Page index](${abs("/pages.json")}): every page with its address, title, summary, status and source file.`,
  `- [Naming registry](${abs("/platform/registry.json")}): every platform component, its interfaces and dependencies.`,
  `- [Work log](${abs("/status.json")}): recent changes, one entry per change.`,
  `- [Sitemap](${abs("/sitemap.xml")})`,
  "",
  "## Optional",
  "",
  `- [Everything in one file](${abs("/llms-full.txt")}): the text of every page above.`,
  "",
);
fs.writeFileSync(path.join(publicDir, "llms.txt"), llms.join("\n"), "utf8");

const full = [
  `# ClearedStack: every page\n\n> ${siteDescription}\n\nGenerated from the site's source at build time. Each page starts with a level-one heading.\n`,
  ...withBody.map(markdownOf),
];
fs.writeFileSync(path.join(publicDir, "llms-full.txt"), full.join("\n---\n\n"), "utf8");

const index = {
  site: siteUrl,
  generated: new Date().toISOString().slice(0, 10),
  pages: pages.map((page) => ({
    ...page,
    body: undefined,
    url: abs(page.url),
    markdown: page.markdown ? abs(page.markdown) : undefined,
  })),
};
fs.writeFileSync(path.join(publicDir, "pages.json"), JSON.stringify(index, null, 2) + "\n", "utf8");

const sortedLog = [...log].sort((a, b) => b.date.localeCompare(a.date));
fs.writeFileSync(path.join(publicDir, "status.json"), JSON.stringify({ entries: sortedLog }, null, 2) + "\n", "utf8");

console.log(
  `Generated llms.txt, llms-full.txt, pages.json, status.json and ${withBody.length} Markdown pages (${warnings.length} warning${warnings.length === 1 ? "" : "s"})`,
);
