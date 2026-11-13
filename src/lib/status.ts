/**
 * How far along the thing a platform page describes is. Platform pages set
 * `status` in their meta; guides about regulations and hosting do not.
 *
 * Kept apart from lib/docs.ts so that browser components can import it
 * without pulling in the file system.
 */
export type DocStatus = "design" | "built" | "running";

export const docStatus: Record<DocStatus, { label: string; meaning: string }> = {
  design: {
    label: "Design",
    meaning: "A specification. It describes how the component is meant to work, not something you can use on this site today.",
  },
  built: {
    label: "Built",
    meaning: "The code exists in its repository and passes its own tests. It is not yet serving this site.",
  },
  running: {
    label: "Running",
    meaning: "Deployed, and you can see it working.",
  },
};
