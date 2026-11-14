// Run with: node --test scripts/
import { test } from "node:test";
import assert from "node:assert/strict";
import { compare, findProblems } from "./architecture.mjs";

const component = (slug, extra) => ({
  slug,
  name: slug,
  namespace: "clearedstack",
  reachableFrom: ["clearedstack"],
  dependsOn: [],
  edges: [],
  ...extra,
});

const registry = () => ({
  externals: { github: { name: "GitHub" } },
  components: [
    component("plainforge", { edges: [{ to: "github", kind: "mirrors" }] }),
    component("muster", { reachableFrom: ["clearedstack", "cs-workers"] }),
    component("moldloft", {
      namespace: "cs-workers",
      reachableFrom: [],
      dependsOn: ["muster", "plainforge"],
      edges: [
        { to: "muster", kind: "leases" },
        { to: "plainforge", kind: "commits" },
      ],
      leases: ["approved"],
    }),
  ],
});

const lifecycle = () => ({
  states: [{ id: "approved" }, { id: "building" }],
  transitions: [{ from: "approved", to: "building", actor: "moldloft" }],
});

const walkthrough = () => ({ steps: [{ id: "step-1", actors: ["moldloft"], transitions: ["approved>building"] }] });

const keys = (r = registry(), l = lifecycle(), w = walkthrough()) => findProblems(r, l, w).map((p) => p.key);

test("a worker writing to a component it cannot reach is reported", () => {
  assert.deepEqual(keys(), ["reach:moldloft>plainforge"]);
});

test("an unknown leased state is reported", () => {
  const r = registry();
  r.components[2].leases = ["verified"];
  assert.ok(keys(r).includes("state:moldloft:verified"));
});

test("an edge to a slug that does not exist is reported, not thrown", () => {
  const r = registry();
  r.components[2].edges.push({ to: "nosuch", kind: "reads" });
  assert.ok(keys(r).includes("slug:edge:moldloft>nosuch"));
});

test("dependsOn and edges must agree", () => {
  const r = registry();
  r.components[2].dependsOn.push("plainforge-missing");
  assert.ok(keys(r).includes("depends:moldloft:plainforge-missing"));
  const r2 = registry();
  r2.components[1].edges.push({ to: "plainforge", kind: "reads" });
  assert.ok(keys(r2).includes("depends:muster:plainforge"));
});

test("a notifies edge does not need a dependsOn entry", () => {
  const r = registry();
  r.components[0].edges.push({ to: "muster", kind: "notifies" });
  assert.ok(!keys(r).some((k) => k.startsWith("depends:plainforge")));
});

test("two components with the same kind of edge to one external target are reported", () => {
  const r = registry();
  r.components[2].edges.push({ to: "github", kind: "mirrors" });
  assert.ok(keys(r).includes("external:github:mirrors"));
});

test("an unknown actor or transition is reported", () => {
  const l = lifecycle();
  l.transitions.push({ from: "approved", to: "building", actor: "ghost" });
  assert.ok(keys(registry(), l).includes("actor:approved>building:ghost"));
  const w = walkthrough();
  w.steps[0].transitions.push("x>y");
  assert.ok(keys(registry(), lifecycle(), w).includes("walk:step-1:x>y"));
});

test("compare: unlisted problems fail, listed ones pass, stale entries fail", () => {
  const problems = [{ key: "a", message: "A" }, { key: "b", message: "B" }];
  const result = compare(problems, { questions: [{ key: "b" }, { key: "gone" }] });
  assert.deepEqual(result.known.map((p) => p.key), ["b"]);
  assert.deepEqual(result.errors.map((p) => p.key), ["a", "stale:gone"]);
});
