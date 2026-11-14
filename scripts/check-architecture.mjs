#!/usr/bin/env node
// Checks that the registry, the item lifecycle and the walk-through agree.
// Runs before every build; see scripts/architecture.mjs for the rules.
import { readFileSync } from "node:fs";
import { compare, findProblems } from "./architecture.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), "utf8"));

const { known, errors } = compare(
  findProblems(read("registry.json"), read("lifecycle.json"), read("walkthrough.json")),
  read("open-questions.json"),
);

for (const p of known) console.warn(`architecture: open question (src/data/open-questions.json) ${p.key}: ${p.message}`);
for (const p of errors) console.error(`architecture: ERROR ${p.key}: ${p.message}`);

if (errors.length > 0) {
  console.error(
    `architecture: ${errors.length} problem(s). Fix the data in src/data/, or, if the owner has to decide, list the key in src/data/open-questions.json.`,
  );
  process.exit(1);
}
console.log(`architecture: consistent (${known.length} open question(s) waiting on the owner).`);
