// Reads catalog/tools.json and src/data/catalog.ts for the build scripts.
// The merge rule itself lives in src/data/tools-json.mjs.

import fs from "node:fs";
import path from "node:path";

import { mergeToolsJson, parseToolsJson } from "../src/data/tools-json.mjs";

/** The parsed catalog/tools.json under `root`, or null when there is none. */
export function readToolsJson(root) {
  const file = path.join(root, "catalog", "tools.json");
  return fs.existsSync(file) ? parseToolsJson(fs.readFileSync(file, "utf8")) : null;
}

/**
 * The tools and categories from src/data/catalog.ts, with tools.json applied.
 * catalog.ts is read as text, so `source` is returned for the other checks;
 * `toolsJson` is the checked file (or null) for src/data/catalog.ts.
 */
export function loadCatalog(root) {
  const source = fs.readFileSync(path.join(root, "src", "data", "catalog.ts"), "utf8");
  const toolsMatch = source.match(/const catalogTools: (?:readonly )?Tool\[\] = (\[[\s\S]*?\n\]);/);
  const categoriesMatch = source.match(/export const categories: (?:readonly )?Category\[\] = (\[[\s\S]*?\n\]);/);
  const toolsJson = readToolsJson(root);
  const tools = toolsMatch ? mergeToolsJson(eval(toolsMatch[1]), toolsJson) : [];
  const categories = categoriesMatch ? eval(categoriesMatch[1]) : [];
  return { source, toolsFound: Boolean(toolsMatch), tools, categories, toolsJson };
}
