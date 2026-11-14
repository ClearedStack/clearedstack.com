import registry from "@/data/registry.json";

/**
 * The platform's components, read from the naming registry.
 *
 * src/data/registry.json is the single place a component's name is written
 * down. To rename one, change `name` and `slug` there, add the name it had to
 * `earlierNames`, and rename its page in src/platform to match the new slug.
 * The old addresses keep working (see lib/docs.ts).
 *
 * The same file is published at /platform/registry.json for manifests,
 * pipelines and other repositories to read.
 */
export type PlatformComponent = {
  /** Lowercase identifier: the repository, the workload and the page at /platform/<slug>/. */
  slug: string;
  /** The canonical name, as written in prose. */
  name: string;
  /** The identifier this name replaced. */
  formerly: string;
  /** Names it has carried since, before the current one. Their addresses still work. */
  earlierNames?: string[];
  kind: "control-plane" | "worker";
  /** Where it sits in the repo map: the public site, the record, the code path or the pipeline. */
  layer: "public" | "record" | "code" | "worker";
  /** Workers only: position in the pipeline, 1 to 10. */
  stage?: number;
  namespace: string;
  /** Namespaces the network policy lets in, or "public" for the one service reachable from outside. */
  reachableFrom: string[];
  /** What it is for, in terms that survive a change of implementation. */
  responsibility: string;
  /** Its boundaries: what it exposes and what it calls. */
  interfaces: string[];
  /** Repository name under the organization. */
  repository: string;
  /** Image name in the cluster's registry. */
  image: string;
  /** Slugs of the components it cannot work without. */
  dependsOn: string[];
  /** Every connection it makes, to another component or to an external in `externals`. */
  edges: Edge[];
  /** Workers only: the item states it takes from Muster. */
  leases?: string[];
  memory: string;
  version: string;
  subTools: string[];
};

export type Edge = {
  /** A component slug, or a key of `externals`. */
  to: string;
  kind: "leases" | "reads" | "writes" | "commits" | "pushes" | "mirrors" | "notifies";
  note: string;
};

/** Things outside the platform that components connect to, keyed by the id edges use. */
export const externals = registry.externals as Record<string, { name: string; detail: string }>;

export const components = registry.components as PlatformComponent[];
export const controlPlane = components.filter((component) => component.kind === "control-plane");
export const workers = components
  .filter((component) => component.kind === "worker")
  .sort((a, b) => (a.stage ?? 0) - (b.stage ?? 0));

export const registryMeta = {
  organization: registry.organization,
  imageRegistry: registry.imageRegistry,
};

export function findComponent(slug: string): PlatformComponent | undefined {
  return components.find((component) => component.slug === slug);
}

/** The component that used to go by an identifier such as "cs-01-intake". */
export function findByFormerId(id: string): PlatformComponent | undefined {
  return components.find((component) => component.formerly === id);
}

/** The display name of a component slug or an external. */
export function nameOf(id: string): string {
  return findComponent(id)?.name ?? externals[id]?.name ?? id;
}

/** The components that depend on the given one. */
export function dependents(slug: string): PlatformComponent[] {
  return components.filter((component) => component.dependsOn.includes(slug));
}

/** "Stage 03" for a worker, nothing for a control-plane service. */
export function stageLabel(component: PlatformComponent): string | undefined {
  return component.stage ? `Stage ${String(component.stage).padStart(2, "0")}` : undefined;
}
