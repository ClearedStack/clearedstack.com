/**
 * Consistency rules for the platform's architecture data.
 *
 * The registry (components and how they connect), the item lifecycle (states
 * and moves) and the walk-through (the order the site explains them in) are
 * written separately. These rules find where they disagree, so a contradiction
 * fails the build instead of reaching a page. Pure functions, no file access:
 * scripts/check-architecture.mjs reads the files and runs them.
 */

/** Edge kinds that change the target. Two components doing one of these to the same outside system is an ownership overlap. */
const WRITING_KINDS = new Set(["commits", "mirrors", "pushes", "writes"]);

/**
 * @returns {{ key: string, message: string }[]} one entry per problem, each with a stable key
 */
export function findProblems(registry, lifecycle, walkthrough) {
  const problems = new Map();
  const report = (key, message) => problems.has(key) || problems.set(key, { key, message });

  const components = new Map(registry.components.map((c) => [c.slug, c]));
  const externals = new Set(Object.keys(registry.externals ?? {}));
  const known = (slug) => components.has(slug) || externals.has(slug);
  const states = new Set(lifecycle.states.map((s) => s.id));
  const transitions = new Set(lifecycle.transitions.map((t) => `${t.from}>${t.to}`));
  const writers = new Map();

  for (const c of components.values()) {
    for (const edge of c.edges ?? []) {
      if (!known(edge.to)) {
        report(`slug:edge:${c.slug}>${edge.to}`, `${c.slug} has an edge to "${edge.to}", which is neither a component nor an external.`);
        continue;
      }
      const target = components.get(edge.to);
      if (target) {
        if (!(target.reachableFrom ?? []).includes(c.namespace)) {
          report(
            `reach:${c.slug}>${edge.to}`,
            `${c.slug} ${edge.kind} ${edge.to}, but ${edge.to} accepts connections only from ${(target.reachableFrom ?? []).join(", ") || "nothing"}, and ${c.slug} runs in ${c.namespace}.`,
          );
        }
        if (edge.kind !== "notifies" && !c.dependsOn.includes(edge.to)) {
          report(`depends:${c.slug}:${edge.to}`, `${c.slug} ${edge.kind} ${edge.to}, but dependsOn does not list ${edge.to}.`);
        }
      } else if (WRITING_KINDS.has(edge.kind)) {
        const id = `${edge.to}:${edge.kind}`;
        writers.set(id, [...(writers.get(id) ?? []), c.slug]);
      }
    }
    for (const dep of c.dependsOn) {
      if (!(c.edges ?? []).some((edge) => edge.to === dep)) {
        report(`depends:${c.slug}:${dep}`, `${c.slug} lists ${dep} in dependsOn, but has no edge to it.`);
      }
    }
    for (const state of c.leases ?? []) {
      if (!states.has(state)) report(`state:${c.slug}:${state}`, `${c.slug} leases items in state "${state}", which is not one of the lifecycle states.`);
    }
  }

  for (const [id, slugs] of writers) {
    if (slugs.length > 1) {
      const [to, kind] = id.split(":");
      report(`external:${id}`, `${slugs.join(" and ")} each have a "${kind}" connection to ${to}. One component should own it.`);
    }
  }

  for (const t of lifecycle.transitions) {
    const id = `${t.from}>${t.to}`;
    for (const end of [t.from, t.to]) {
      if (!states.has(end)) report(`transition:${id}`, `The move ${id} names a state that does not exist.`);
    }
    if (!known(t.actor)) report(`actor:${id}:${t.actor}`, `The move ${id} is made by "${t.actor}", which is neither a component nor an external.`);
  }

  for (const step of walkthrough.steps) {
    for (const actor of step.actors) {
      if (!known(actor)) report(`walk:${step.id}:${actor}`, `Walk-through step ${step.id} names "${actor}", which is neither a component nor an external.`);
    }
    for (const id of [...(step.transitions ?? []), ...(step.offRamps ?? [])]) {
      if (!transitions.has(id)) report(`walk:${step.id}:${id}`, `Walk-through step ${step.id} names the move ${id}, which is not in the lifecycle.`);
    }
  }

  return [...problems.values()];
}

/**
 * Splits problems into those the owner already knows about (listed in
 * open-questions.json) and errors. A listed question that no longer occurs is
 * an error too, so the list cannot go stale.
 */
export function compare(problems, openQuestions) {
  const listed = new Set(openQuestions.questions.map((q) => q.key));
  const found = new Set(problems.map((p) => p.key));
  return {
    known: problems.filter((p) => listed.has(p.key)),
    errors: [
      ...problems.filter((p) => !listed.has(p.key)),
      ...[...listed]
        .filter((key) => !found.has(key))
        .map((key) => ({ key: `stale:${key}`, message: `open-questions.json lists "${key}", but that problem no longer occurs. Remove it.` })),
    ],
  };
}
