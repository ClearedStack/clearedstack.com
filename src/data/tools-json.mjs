// The one place that reads catalog/tools.json and applies it to the tool list.
//
// Chartroom writes catalog/tools.json (contract "v1"; the shape is
// internal/catalog in the ClearedStack/chartroom repository). The build
// reads it and stops with a message if anything in it is off. No file means
// no change. Nothing here touches the file system, so the site's own code
// can import it; scripts/load-catalog.mjs does the reading.
//
// Used by: src/data/catalog.ts and both generator scripts.
// Text from the file is only ever data: pages print it as plain text.

const CONTRACT = "v1";
const FILE = "catalog/tools.json";

// What each status must carry. `need` keys are required, `may` keys are
// optional, and any other key is refused. This mirrors Chartroom's validate.go.
const BASE = ["slug", "status", "title", "summary"];
const SHAPES = {
  live: { need: ["repository", "provenance"], may: [] },
  linked: { need: ["link", "provenance"], may: [] },
  merged: { need: ["merge"], may: ["provenance"] },
  retired: { need: ["repository", "provenance", "retirement"], may: [] },
};

const fail = (message) => {
  throw new Error(`${FILE}: ${message}`);
};

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isText = (v) => typeof v === "string" && v.trim() !== "";

// An https address with no user name or password. It ends up in an href.
function isHttps(v) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password && u.hostname.includes(".");
  } catch {
    return false;
  }
}

function checkKeys(where, value, allowed) {
  if (!isObject(value)) fail(`${where} must be an object`);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(`${where} has an unknown or misplaced field "${key}"`);
  }
}

function checkNested(where, entry) {
  const { provenance, link, merge, retirement } = entry;
  if (provenance !== undefined) {
    checkKeys(`${where} provenance`, provenance, ["note", "links"]);
    if (!isText(provenance.note)) fail(`${where} provenance.note must be text`);
    if (!Array.isArray(provenance.links) || !provenance.links.every(isHttps)) {
      fail(`${where} provenance.links must be a list of https addresses`);
    }
  }
  if (link !== undefined) {
    checkKeys(`${where} link`, link, ["name", "url"]);
    if (!isText(link.name) || !isHttps(link.url)) fail(`${where} link needs a name and an https url`);
  }
  if (merge !== undefined) {
    checkKeys(`${where} merge`, merge, ["parent", "note"]);
    if (!isText(merge.parent) || !isText(merge.note)) fail(`${where} merge needs a parent and a note`);
  }
  if (retirement !== undefined) {
    checkKeys(`${where} retirement`, retirement, ["reason", "note"]);
    if (!["repealed", "superseded"].includes(retirement.reason) || !isText(retirement.note)) {
      fail(`${where} retirement needs a reason (repealed or superseded) and a note`);
    }
  }
}

/** Parses the text of catalog/tools.json. Throws on anything unexpected. */
export function parseToolsJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    fail(`not valid JSON (${err.message})`);
  }
  checkKeys("the file", data, ["contract", "entries"]);
  if (data.contract !== CONTRACT) fail(`unknown contract ${JSON.stringify(data.contract)}, expected "${CONTRACT}"`);
  if (!Array.isArray(data.entries)) fail("entries must be a list");

  const seen = new Set();
  for (const entry of data.entries) {
    if (!isObject(entry) || !isText(entry.slug)) fail("every entry needs a slug");
    const where = `entry "${entry.slug}"`;
    if (seen.has(entry.slug)) fail(`duplicate slug "${entry.slug}"`);
    seen.add(entry.slug);
    const shape = SHAPES[entry.status];
    if (!shape) fail(`${where} has an unknown status ${JSON.stringify(entry.status)}`);
    checkKeys(where, entry, [...BASE, ...shape.need, ...shape.may]);
    for (const key of [...BASE, ...shape.need]) {
      if (entry[key] === undefined) fail(`${where} is missing "${key}"`);
    }
    if (!isText(entry.title) || !isText(entry.summary)) fail(`${where} needs a title and a summary`);
    if (entry.repository !== undefined && !isHttps(entry.repository)) fail(`${where} repository must be an https address`);
    checkNested(where, entry);
  }
  return data;
}

/**
 * Returns `tools` with the catalog applied (a new list; `tools` is not
 * changed). A "live" entry makes that tool live and fills `repo`. A live slug
 * that is not in `tools` is an error.
 *
 * ponytail: "linked", "merged" and "retired" entries are read and validated
 * but change nothing yet. Add their handling here when the site shows them.
 */
export function mergeToolsJson(tools, catalog) {
  if (!catalog) return tools;
  const live = new Map(catalog.entries.filter((e) => e.status === "live").map((e) => [e.slug, e]));
  for (const slug of live.keys()) {
    if (!tools.some((tool) => tool.slug === slug)) {
      fail(`"${slug}" is live but is not in src/data/catalog.ts; add it there first`);
    }
  }
  return tools.map((tool) => {
    const entry = live.get(tool.slug);
    return entry ? { ...tool, status: "live", repo: entry.repository } : tool;
  });
}
