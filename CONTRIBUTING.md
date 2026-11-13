# Contributing

Thanks for wanting to help. There are three ways to do it.

## Suggest a tool

Open an issue describing the job the tool should do, who needs it, and the
regulation, standard or guide it would be based on. A link to the public
source is the most useful thing you can include.

## Fix or improve this site

Small fixes can go straight to a pull request. For anything larger, open an
issue first so the work is not wasted.

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
