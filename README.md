<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/logo-dark.svg">
    <img src="public/brand/logo-light.svg" alt="ClearedStack" width="320">
  </picture>
</p>

<p align="center">
  <strong>Free, open-source tools for the paperwork between you and a government contract.</strong><br>
  <a href="https://clearedstack.com">clearedstack.com</a>
</p>

---

ClearedStack is a growing set of small, single-purpose tools for government
contracting and defense tech: pricing, proposals, cyber compliance, market
research and DevSecOps. Every tool runs in the browser, costs nothing and
ships with its source.

This repository is the **website**: the hub at clearedstack.com that explains
the project and lists the tools. Each tool is a separate project in its own
repository.

## Why

Selling to the Department of Defense takes more than being good at the work.
Before a small company can bid, it has to price labor under FAR Part 31, build
indirect rates an auditor will accept, answer every line of Sections L and M,
and show how it protects CUI under NIST SP 800-171 and CMMC. Large contractors
have departments for that. A one-person company has evenings.

Almost all of that knowledge is public. What costs money is turning it into a
worked answer for one company's situation, and that step is mostly arithmetic,
lookup tables and checklists. ClearedStack turns that step into tools and
gives the tools away, so that someone who can do the work can also get through
the paperwork.

## Ground rules

| | |
| --- | --- |
| **Free** | No paywall, ads, subscriptions, sponsorships or donations. The project takes in no revenue. |
| **Open source** | MIT licensed. Read the code, check the math, fork it, host it yourself. |
| **Client-side** | Tools run in your browser. Your rates, proposal text and system details stay on your machine. |
| **No tracking** | No analytics, cookies or accounts. The site makes no third-party requests and enforces that with a content security policy. |
| **Public sources only** | Built only from material the government has officially released to the public. Nothing classified, controlled or non-public, and a leaked document does not count as public. |
| **Independent** | A personal project with no government affiliation. See the [disclaimer](#disclaimer). |

## The catalog

Eighteen tools are planned across five areas. None are live yet; each will be
linked from the site the day it works.

| Area | Tools |
| --- | --- |
| **Pricing & cost accounting** | Wrap Rate Calculator · Indirect Rate Estimator · Section B Pricing Table Builder · Prompt Payment Interest Tracker |
| **Proposal & capture** | RFP Requirement Shredder · Compliance Matrix Generator · Acronym Table Builder · Page Budget Planner |
| **Cybersecurity & compliance** | NIST SP 800-171 / CMMC Readiness Checklist · CUI Marking Generator · DISA STIG Reference Lookup · OSCAL Validator |
| **Market research & small business** | NAICS-to-PSC Crosswalk · NDC Eligibility Checker · Small Business Set-Aside Guide |
| **Tactical & DevSecOps** | Offline Manifest Inspector · Certificate Verifier · Air-Gap Transfer Helpers |

The list on the site is generated from [`src/data/catalog.ts`](src/data/catalog.ts).

## Roadmap

1. **The free arsenal.** Ship the catalog one tool at a time.
2. **The community.** Open the catalog to tools written by other engineers, veterans and people who do this work for a living.
3. **The institution.** Grow that community into something lasting that can compete for the work itself.

## Working on the site

The site is [Next.js](https://nextjs.org) with TypeScript and Tailwind CSS,
exported as static files. It has no server, no API routes and no database.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build      # writes the static site to out/
npm run preview    # serves out/ locally
```

Requires Node.js 20 or newer. The contents of `out/` can be hosted on any
static file host.

```
src/
  app/            pages: home, /tools, /guides, /about, plus icons and metadata
  components/     header, footer, logo, catalog list, guides list
  data/
    catalog.ts    the categories and tools shown on the site
    site.ts       name, URLs, contact address, short disclaimer
  guides/         one .mdx file per guide
  lib/guides.ts   the guide sections, and the code that reads and orders the guides
public/brand/     logo files (SVG, light and dark)
Dockerfile        builds the site and serves it with nginx
docker/           nginx configuration used by the image
k8s/              Kubernetes manifests: deployment, service, example ingress
```

### Hosting with Docker

```bash
docker build -t clearedstack .
```

```bash
docker run -d --name clearedstack --restart unless-stopped -p 8080:8080 clearedstack
```

The site is then at http://localhost:8080. The image is roughly 100 MB, holds
only nginx and the built pages, and runs as a non-root user. The
[Docker guide](src/guides/host-with-docker.mdx) covers updates, custom
domains and moving the image to a network with no internet.

### Hosting on Kubernetes

Push the image to a registry your cluster can reach, set that image name in
[`k8s/clearedstack.yaml`](k8s/clearedstack.yaml), then:

```bash
kubectl apply -f k8s/clearedstack.yaml
```

The manifest creates a namespace, a two-replica deployment and a service.
The pods run non-root with a read-only filesystem and no added privileges.
The [Kubernetes guide](src/guides/host-on-kubernetes.mdx) has the full steps.
There are also guides for [serving the plain files](src/guides/host-static-files.mdx)
from any web server and for [running on a closed network](src/guides/closed-networks.mdx).

### Listing a tool

Add an entry to `tools` in [`src/data/catalog.ts`](src/data/catalog.ts):

```ts
{
  slug: "wrap-rate-calculator",
  name: "Wrap Rate Calculator",
  summary: "Build a fully burdened labor rate from base pay, fringe, overhead, G&A and fee.",
  category: "pricing",
  status: "live",            // "planned" | "building" | "live"
  url: "https://…",          // where it runs
  repo: "https://github.com/ClearedStack/…",
},
```

The home page, the catalog page and their counts update from that one entry.
See [CONTRIBUTING.md](CONTRIBUTING.md) for what a tool needs before it is listed.

### Adding a guide

The [guides](https://clearedstack.com/guides/) explain how to use the site,
give plain-language background on the subjects the tools cover, and show how
to host a copy. Each one is a file in [`src/guides/`](src/guides); the file
name becomes the URL. Start the file with its details, then write the guide in
Markdown:

```mdx
export const meta = {
  title: "Getting started",
  summary: "One sentence shown in the list and under the title.",
  group: "start",        // "start" | "field" | "host" | "contribute" | "reference"
  order: 1,              // position within its section
  reviewed: "2026-11",   // optional: month the facts were last checked
};

Your first paragraph.

## A heading
```

The guides page, the table of contents on each guide, the reading time, the
previous/next links and the sitemap pick it up on the next build. Tables work,
and `<Callout kind="note | check | warning">` sets a short passage apart.
[Work on this site](src/guides/work-on-this-site.mdx) has the details.

Guides that describe regulations set `reviewed` and end with a "Sources"
section. Check each fact against the official text before you write it down.

## Brand

| File | Use |
| --- | --- |
| [`public/brand/logo-light.svg`](public/brand/logo-light.svg) | Full logo on light backgrounds |
| [`public/brand/logo-dark.svg`](public/brand/logo-dark.svg) | Full logo on dark backgrounds |
| [`public/brand/mark-light.svg`](public/brand/mark-light.svg), [`mark-dark.svg`](public/brand/mark-dark.svg) | The mark alone |

Colors: ink `#121714`, paper `#F5F4EF`, green `#17794A` (on light) and
`#4FD08C` (on dark). Type: IBM Plex Sans and IBM Plex Mono, self-hosted.

## Disclaimer

ClearedStack is an independent personal project, built on personal time with
personal equipment. It is not affiliated with, endorsed by, or sponsored by
the U.S. Department of Defense, any military service or any other government
agency. The views expressed are the maintainers' own. They do not represent
the views of the Department of Defense or its components, or an official
position of the U.S. Government.

The name does not grant, verify or imply a security clearance, an
authorization to operate, or any certification.

The tools are aids for your own work. They are not legal, accounting, tax or
compliance advice, and they can be wrong or out of date. Check results against
the current text of the governing regulation before you rely on them.

## License

[MIT](LICENSE). Contact: [contact@clearedstack.com](mailto:contact@clearedstack.com)
