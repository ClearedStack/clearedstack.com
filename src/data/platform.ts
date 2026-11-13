import registry from "@/data/registry.json";

/**
 * The platform's components, read from the naming registry.
 *
 * src/data/registry.json is the single place a component's name is written
 * down. To rename one, change `name` and `slug` there, move the old slug into
 * `formerly`, and rename its page in src/platform to match the new slug. The
 * old addresses keep working (see lib/docs.ts).
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
  kind: "control-plane" | "worker";
  /** Workers only: position in the pipeline, 1 to 10. */
  stage?: number;
  namespace: string;
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
  memory: string;
  version: string;
  subTools: string[];
};

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

/** The components that depend on the given one. */
export function dependents(slug: string): PlatformComponent[] {
  return components.filter((component) => component.dependsOn.includes(slug));
}

/** "Stage 03" for a worker, nothing for a control-plane service. */
export function stageLabel(component: PlatformComponent): string | undefined {
  return component.stage ? `Stage ${String(component.stage).padStart(2, "0")}` : undefined;
}
