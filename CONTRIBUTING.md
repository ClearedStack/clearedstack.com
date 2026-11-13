# Contributing

Thanks for wanting to help. There are three ways to do it.

## Suggest an idea

Suggestions from the community feed directly into the **Discover** stage of our Prior Art process (currently in draft). Open an issue describing:

- The job the tool should do (in one sentence, starting with a verb).
- Who needs it (the small-business paperwork problem it addresses).
- Where the idea was seen (if inspired by an existing product, spreadsheet or government tool).
- The public regulation, standard or guide it would be based on (with a link to the official public source).

Community suggestions are recorded as candidate ideas and walk through the same observation, screening gates and scoring rubric described at [How we decide](https://clearedstack.com/how-we-decide/).

## Fix or improve this site

Small fixes can go straight to a pull request. For anything larger, open an
issue first so the work is not wasted.

The guides are text files in [`src/guides/`](src/guides), so correcting one is
an ordinary pull request. [Work on this site](src/guides/work-on-this-site.mdx)
shows where everything is and how a guide is written.

```bash
npm install
npm run dev
```

Before you open a pull request, run:

```bash
npm run lint
npm run typecheck
npm run build
```

## List a tool you built

Tools live in their own repositories. To have one listed here, add an entry to
[`src/data/catalog.ts`](src/data/catalog.ts) and open a pull request. A tool is
listed when it meets all of these:

- **Free and open source.** An OSI-approved license, no paid tier, no ads.
- **Client-side.** It runs in the browser or on the user's machine. It does not
  send what the user enters to any server.
- **No tracking.** No analytics, no third-party scripts, no accounts.
- **Public sources only.** Built from regulations, standards and guidance the
  government has officially released to the public, and it says which ones.
- **Honest about limits.** It states what it does not cover and that its output
  is not legal, accounting or compliance advice.

### Provenance and clean-room rules for listed tools

Every tool listed in the catalog must record its **provenance** (where the idea came from):

- **What we take**: We take only the *idea* of a job to be done.
- **Clean-room rule**: Never copy code, text, screenshots, UI layout, data files, names or logos from another tool. Builders work strictly from the public regulation and our own functional specification. Reusing open-source code is allowed only under its license with its copyright notice preserved.
- **Credit**: The tool's catalog entry records who inspired it (e.g. government tool, commercial product, spreadsheet or community suggestion) in its `provenance` block.

## Using AI tools

Using AI tools (such as Claude Code, Antigravity, GitHub Copilot or ChatGPT) to help write code, tests, guides or suggestions is welcome, under the same strict rules we follow:

- **Strict data rules**: Never paste Controlled Unclassified Information (CUI), non-public government information, real company contract numbers, real labor rates, or personal data into any AI prompt. All test fixtures and examples must be made up.
- **Human verification**: A human must review every line of code, verify every mathematical formula, and check every regulatory citation against the official government source before submitting a pull request. AI output is never the authoritative source of a rule.
- **Commit trailer**: Going forward, commits created with AI assistance should include a git trailer naming the tool used (for example: `Assisted-by: Claude Code` or `Assisted-by: Antigravity`).

## Ground rules for all contributions

- Never include classified information, controlled unclassified information
  (CUI), export-controlled data, or anything else that is not public. That
  covers code, test data, screenshots, issues and commit messages.
- "Public" means officially released. A document that leaked, or that is
  marked for limited distribution but can be found online anyway, is not
  public for this project. If you are unsure, leave it out.
- If you work for the government or hold a clearance, your own obligations
  come first. Contribute only on your own time and equipment, and only what
  you are free to share.
- Do not include real contract data, real rates or anything identifying a
  real company's bid. Make up the examples.
- By contributing you agree that your work is released under the
  [MIT License](LICENSE).
