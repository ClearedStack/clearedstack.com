import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The work log: src/data/status.jsonl, one JSON object per line.
 *
 * People and agents add to it by appending a line; nothing else needs to
 * change for the entry to appear on /status/ and in /status.json. The format,
 * and the checks a line has to pass, are in AGENTS.md and
 * scripts/generate-ai-files.mjs.
 */
export type WorkLogState = "done" | "in-progress" | "blocked" | "planned";

export type WorkLogEntry = {
  /** The day of the change, as "YYYY-MM-DD". */
  date: string;
  /** What it is about: a component slug such as "muster", or "site". */
  area: string;
  state: WorkLogState;
  /** One plain sentence, at most 240 characters. */
  summary: string;
};

export const workLogStates: Record<WorkLogState, string> = {
  done: "Done",
  "in-progress": "In progress",
  blocked: "Blocked",
  planned: "Planned",
};

/** Every entry, newest first. Entries on the same day keep the order they were added in, newest first. */
export function readWorkLog(): WorkLogEntry[] {
  const file = path.join(process.cwd(), "src", "data", "status.jsonl");
  const entries = readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as WorkLogEntry);
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date) || b.index - a.index)
    .map(({ entry }) => entry);
}
