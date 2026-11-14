# Working on clearedstack.com: rules for agents

This file is for AI agents (and people) changing this repository. Read it before you edit anything. The longer, human version is the guide at `src/guides/work-on-this-site.mdx` (served at /guides/work-on-this-site/).

## What this repository is

The ClearedStack website: a Next.js site exported to plain static files in `out/` and served by nginx. No server, database or API. It is also the Conn component of the platform.

## Where things live

| You want to change | Edit this | Served at |
| --- | --- | --- |
| A guide | `src/guides/<slug>.mdx` | `/guides/<slug>/` |
| A platform page or component spec | `src/platform/<slug>.mdx` | `/platform/<slug>/` |
| A tool's catalog entry | `src/data/catalog.ts` (plain object literals) | `/tools/<slug>/` |
| A tool's detailed specification | `src/tools/<slug>.mdx` | shown on `/tools/<slug>/` |
| A component's name, interfaces or dependencies | `src/data/registry.json` (the only place a name is written) | `/platform/registry.json` |
| The work log | append a line to `src/data/status.jsonl` | `/status/` and `/status.json` |
| Site name, address, revision month | `src/data/site.ts` | every page |
| Home, About and index pages | `src/app/**/page.tsx` | |

### How the catalog works

`src/data/catalog.ts` lists the tools by hand (`catalogTools`) and exports the merged list `tools`. If `catalog/tools.json` exists (Chartroom writes it; do not add or edit it here), the build reads it through `src/data/tools-json.mjs`: a `live` entry marks that tool live and sets `repo`; `linked`, `merged` and `retired` entries are only validated for now. A bad file, or a `live` slug missing from `catalog.ts`, stops the build. Pages (through the generated `src/data/tools-json.generated.json`) and both generator scripts all use that one merge, so do not read `catalog.ts` or `tools.json` another way. `npm test` runs its tests.

One file per page. To add a page, add a file to the right folder; the index, table of contents, search, sitemap, `llms.txt` and the Markdown copy all pick it up. To move a page, keep the old address working (see `movedGuides` in `src/lib/docs.ts`).

## Page details (the `meta` block)

Every `.mdx` page in `src/guides` and `src/platform` starts with:

```mdx
export const meta = {
  title: "Short title",
  summary: "One sentence, shown in lists, search and llms.txt.",
  group: "factory",      // guides: start, field, host, contribute, reference
                         // platform: factory, cluster, governance, components
  order: 1,              // position within its group
  revised: "2026-11",    // month last changed, "YYYY-MM"
  status: "design",      // platform pages: design, built or running
};
```

Set `status` to what is true today, not what is planned. Bump `revised` when you change a page. Guides about regulations also set `reviewed` and end with a "Sources" section.

## Adding to the work log

When you finish, start or get stuck on a piece of work, append one line to `src/data/status.jsonl`. Do not edit or reorder earlier lines.

```json
{"date":"2026-11-14","area":"muster","state":"done","summary":"Muster runs on the cluster with its SQL store and passes the contract examples."}
```

- `date`: the day, `YYYY-MM-DD`.
- `area`: a component slug from `src/data/registry.json` (it links to that page), or `site`, or another short lowercase slug.
- `state`: `done`, `in-progress`, `blocked` or `planned`.
- `summary`: one plain sentence, at most 240 characters. Say what changed, not how.

The build rejects a line that is not valid JSON, uses another state, or contains an email address, an IP address or an internal hostname.

## Writing rules

- **No em dashes.** Use a comma, a colon or a new sentence. The build prints a warning for every file that has one.
- **No personal information** about the owner or anyone else: no names beyond what the site already shows, no work history, no home or location details, no personal email addresses or accounts.
- **Nothing internal:** no IP addresses, internal hostnames, cluster addresses, session or task ids, tokens, keys or passwords. Nothing secret goes in Git at all.
- **Public sources only**, and made-up examples only: no real companies, contracts, program offices or rates.
- **Mark what is decided and what is proposed.** A design page says which choices are settled and which are still ideas.
- Plain words, short sentences, one idea per paragraph. Define a term the first time it appears.
- **Nothing loads from another server** and nothing tracks visitors. The content security policy depends on it.
- In MDX, a left curly brace and a less-than sign are read as code. Write them in words or in backticks.

## Generated files: do not edit

- `src/data/tools-json.generated.json` (from `scripts/generate-search-index.mjs`)
- `src/data/search-data.json` (from `scripts/generate-search-index.mjs`)
- `public/llms.txt`, `public/llms-full.txt`, `public/pages.json`, `public/status.json` and every `public/{guides,platform,tools}/*.md` (from `scripts/generate-ai-files.mjs`; not committed)

Change the source in `src/` and rebuild.

## Check your change

```bash
npm ci
npm test                # catalog/tools.json rules; fast
npm run check:content   # page details and work log; fast
npm run lint
npm run typecheck
npm run build           # compiles every page into out/
```

All must finish without errors. Then open the pages you changed (`npm run dev`, or `npm run preview` after a build) at a narrow width and in dark mode.

## Sending a change

Work on a branch and open a pull request against `main` on Plainforge, the project's own Git server. Never push to `main`, never merge your own pull request, and never deploy: a person approves every merge. One agent works on this repository at a time. Commits drafted with AI carry an `Assisted-by:` trailer naming the tool.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
