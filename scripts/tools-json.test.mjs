// Tests for how the build reads catalog/tools.json. Run with `npm test`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { mergeToolsJson, parseToolsJson, siteFields } from "../src/data/tools-json.mjs";
import { readToolsJson } from "./load-catalog.mjs";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = (name) => fs.readFileSync(path.join(repoRoot, "testdata", "catalog", name), "utf8");
const baseTools = () => [
  { slug: "wrap-rate-calculator", name: "Wrap Rate Calculator", status: "planned" },
  { slug: "page-budget-planner", name: "Page Budget Planner", status: "building" },
];

test("no tools.json means no change", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tools-json-"));
  assert.equal(readToolsJson(root), null);
  const tools = baseTools();
  assert.deepEqual(mergeToolsJson(tools, null), tools);
});

test("a live entry makes the tool live and fills repo", () => {
  const merged = mergeToolsJson(baseTools(), parseToolsJson(fixture("ok-live.json")));
  const tool = merged.find((t) => t.slug === "wrap-rate-calculator");
  assert.equal(tool.status, "live");
  assert.equal(tool.repo, "https://forge.example/tools/wrap-rate-calculator");
  assert.equal(merged.find((t) => t.slug === "page-budget-planner").status, "building");
});

test("the merge does not change the list it was given", () => {
  const tools = baseTools();
  mergeToolsJson(tools, parseToolsJson(fixture("ok-live.json")));
  assert.equal(tools[0].status, "planned");
});

test("linked, merged and retired entries are valid and change nothing", () => {
  const tools = baseTools();
  assert.deepEqual(mergeToolsJson(tools, parseToolsJson(fixture("ok-other-statuses.json"))), tools);
});

for (const [file, message] of [
  ["bad-contract.json", /contract/],
  ["bad-status.json", /wrap-rate-calculator.*status/],
  ["unknown-field.json", /wrap-rate-calculator.*colour/],
  ["duplicate-slug.json", /duplicate.*wrap-rate-calculator/],
  ["bad-repository.json", /wrap-rate-calculator.*repository/],
]) {
  test(`${file} is refused`, () => {
    assert.throws(() => parseToolsJson(fixture(file)), message);
  });
}

// The address is stored as written and ends up in href and Markdown, so it
// must be exactly what the URL parser would write: no spaces, no line breaks.
for (const [name, repository] of [
  ["a newline", "https://forge.example/x\n## Injected heading"],
  ["a space", "https://forge.example/x y"],
  ["a tab", "https://forge.example/x\ty"],
  ["an uppercase host", "https://Forge.example/x"],
]) {
  test(`a repository with ${name} is refused`, () => {
    const text = fixture("ok-live.json").replace("https://forge.example/tools/wrap-rate-calculator", JSON.stringify(repository).slice(1, -1));
    assert.throws(() => parseToolsJson(text), /wrap-rate-calculator.*repository/);
  });
}

test("a status named like an Object property is an unknown status, not a crash", () => {
  const text = fixture("ok-live.json").replace('"live"', '"constructor"');
  assert.throws(() => parseToolsJson(text), /wrap-rate-calculator.*unknown status/);
});

test("the pages get only slug, status and repository", () => {
  const slim = siteFields(parseToolsJson(fixture("ok-live.json")));
  assert.deepEqual(slim, {
    contract: "v1",
    entries: [{ slug: "wrap-rate-calculator", status: "live", repository: "https://forge.example/tools/wrap-rate-calculator" }],
  });
  assert.equal(siteFields(null), null);
});

test("not JSON, and a missing entries list, are refused", () => {
  assert.throws(() => parseToolsJson("{"), /tools\.json/);
  assert.throws(() => parseToolsJson('{"contract":"v1"}'), /entries/);
  assert.throws(() => parseToolsJson('{"contract":"v1","entries":[],"extra":1}'), /extra/);
});

test("a live slug that is not in catalog.ts is refused", () => {
  const catalog = parseToolsJson(fixture("live-not-in-catalog.json"));
  assert.throws(() => mergeToolsJson(baseTools(), catalog), /no-such-tool.*catalog\.ts/);
});

// Each generator must stop the build on a bad file. The temporary root holds
// the bad file and a link to this repository's src, which is only read
// because the scripts stop before they write anything.
for (const script of ["generate-search-index.mjs", "generate-ai-files.mjs"]) {
  for (const file of ["unknown-field.json", "live-not-in-catalog.json"]) {
    test(`${script} stops on ${file}`, () => {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), "tools-json-"));
      fs.symlinkSync(path.join(repoRoot, "src"), path.join(root, "src"));
      fs.mkdirSync(path.join(root, "catalog"));
      fs.writeFileSync(path.join(root, "catalog", "tools.json"), fixture(file));
      const run = spawnSync(process.execPath, [path.join(repoRoot, "scripts", script)], { cwd: root, encoding: "utf8" });
      assert.notEqual(run.status, 0);
      assert.match(run.stderr, /tools\.json/);
    });
  }
}

// The search-index script hands the checked file to the pages (through
// src/data/tools-json.generated.json) and indexes the merged status. It runs
// on a copy of src so the real files are not touched.
test("generate-search-index.mjs writes the checked file and indexes the tool as live", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tools-json-"));
  fs.cpSync(path.join(repoRoot, "src"), path.join(root, "src"), { recursive: true });
  fs.mkdirSync(path.join(root, "catalog"));
  fs.writeFileSync(path.join(root, "catalog", "tools.json"), fixture("ok-live.json"));
  const run = spawnSync(process.execPath, [path.join(repoRoot, "scripts", "generate-search-index.mjs")], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const data = (name) => JSON.parse(fs.readFileSync(path.join(root, "src", "data", name), "utf8"));
  assert.deepEqual(Object.keys(data("tools-json.generated.json").entries[0]), ["slug", "status", "repository"]);
  assert.equal(data("search-data.json").find((d) => d.id === "tool-wrap-rate-calculator").status, "live");

  fs.rmSync(path.join(root, "catalog"), { recursive: true });
  spawnSync(process.execPath, [path.join(repoRoot, "scripts", "generate-search-index.mjs")], { cwd: root, encoding: "utf8" });
  assert.equal(data("tools-json.generated.json"), null);
});

// The pages use `tools` from src/data/catalog.ts. Run the real catalog.ts (its
// types stripped) with the generated file the build would have written, and
// check that the exported list is the merged one.
test("catalog.ts exports the merged tools", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tools-json-"));
  const generated = JSON.stringify(siteFields(parseToolsJson(fixture("ok-live.json"))));
  const code = stripTypeScriptTypes(fs.readFileSync(path.join(repoRoot, "src", "data", "catalog.ts"), "utf8"))
    .replace(/import toolsJson from "\.\/tools-json\.generated\.json";/, `const toolsJson = ${generated};`)
    .replace('"./tools-json.mjs"', JSON.stringify(path.join(repoRoot, "src", "data", "tools-json.mjs")));
  assert.match(code, /const toolsJson = /);
  fs.writeFileSync(path.join(dir, "catalog.mjs"), code);
  const { tools, liveCount, findTool } = await import(path.join(dir, "catalog.mjs"));
  assert.equal(findTool("wrap-rate-calculator").status, "live");
  assert.equal(findTool("wrap-rate-calculator").repo, "https://forge.example/tools/wrap-rate-calculator");
  assert.equal(liveCount, 1);
  assert.equal(tools.filter((t) => t.status === "live").length, 1);
});
