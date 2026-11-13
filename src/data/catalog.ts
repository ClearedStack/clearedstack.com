/**
 * The tool catalog.
 *
 * Every ClearedStack tool lives in its own repository. This file is the index
 * the website is built from. To list a tool, add an entry to `tools` below;
 * when it ships, set `status` to "live" and fill in `url` and `repo`.
 */

export type CategoryId = "pricing" | "proposal" | "cyber" | "market" | "devsecops";

export type Category = {
  id: CategoryId;
  /** Line-item number shown in the "Section B" table on the home page. */
  clin: string;
  name: string;
  blurb: string;
};

export type ToolStatus = "planned" | "building" | "live";

export type ProvenanceKind =
  | "government"
  | "vendor-free"
  | "commercial"
  | "open-source"
  | "template"
  | "community"
  | "owner";

export type Provenance = {
  /** Where the idea came from. Empty until recorded. */
  inspiredBy?: { name: string; kind: ProvenanceKind; url?: string; observed?: string /* YYYY-MM */ }[];
  /** What was taken (the job) and what was done differently. */
  note?: string;
  /** Prior Art record and decision-log IDs, once the dataset exists. */
  record?: string;
  decision?: string;
};

export type Tool = {
  slug: string;
  name: string;
  summary: string;
  category: CategoryId;
  status: ToolStatus;
  /** Where the tool runs. Set once it is live. */
  url?: string;
  /** Source repository. Set once it is public. */
  repo?: string;
  /** Where the idea came from, what was taken and what was done differently. */
  provenance?: Provenance;
};

export const categories: Category[] = [
  {
    id: "pricing",
    clin: "0001",
    name: "Pricing & cost accounting",
    blurb: "Labor rates, indirect rates and price tables that hold up under FAR Part 31.",
  },
  {
    id: "proposal",
    clin: "0002",
    name: "Proposal & capture",
    blurb: "Take a solicitation apart and prove your response answers all of it.",
  },
  {
    id: "cyber",
    clin: "0003",
    name: "Cybersecurity & compliance",
    blurb: "NIST SP 800-171, CMMC and CUI handling, worked through one requirement at a time.",
  },
  {
    id: "market",
    clin: "0004",
    name: "Market research & small business",
    blurb: "Find the right codes, the right set-asides and the status you already qualify for.",
  },
  {
    id: "devsecops",
    clin: "0005",
    name: "Tactical & DevSecOps",
    blurb: "Utilities for disconnected networks, where nothing can phone home.",
  },
];

export const tools: Tool[] = [
  // Pricing & cost accounting
  {
    slug: "wrap-rate-calculator",
    name: "Wrap Rate Calculator",
    summary: "Build a fully burdened labor rate from base pay, fringe, overhead, G&A and fee.",
    category: "pricing",
    status: "planned",
  },
  {
    slug: "indirect-rate-estimator",
    name: "Indirect Rate Estimator",
    summary: "Turn your cost pools and allocation bases into fringe, overhead and G&A rates.",
    category: "pricing",
    status: "planned",
  },
  {
    slug: "section-b-pricing-table",
    name: "Section B Pricing Table Builder",
    summary: "Lay out CLINs, quantities and extended prices the way the solicitation asks for them.",
    category: "pricing",
    status: "planned",
  },
  {
    slug: "prompt-payment-interest",
    name: "Prompt Payment Interest Tracker",
    summary: "Work out the interest owed on a late government invoice under the Prompt Payment Act.",
    category: "pricing",
    status: "planned",
  },

  // Proposal & capture
  {
    slug: "rfp-requirement-shredder",
    name: "RFP Requirement Shredder",
    summary: "Pull every “shall”, “must” and “will” out of a solicitation into a numbered requirements list.",
    category: "proposal",
    status: "planned",
  },
  {
    slug: "compliance-matrix-generator",
    name: "Compliance Matrix Generator",
    summary: "Map Section L instructions and Section M criteria to the proposal sections that answer them.",
    category: "proposal",
    status: "planned",
  },
  {
    slug: "acronym-table-builder",
    name: "Acronym Table Builder",
    summary: "Find every acronym in a draft and produce the definition table reviewers expect.",
    category: "proposal",
    status: "planned",
  },
  {
    slug: "page-budget-planner",
    name: "Page Budget Planner",
    summary: "Split a page limit across volumes and sections by evaluation weight.",
    category: "proposal",
    status: "planned",
  },

  // Cybersecurity & compliance
  {
    slug: "nist-800-171-checklist",
    name: "NIST SP 800-171 / CMMC Readiness Checklist",
    summary: "Walk the requirements one by one, track what is implemented and see where you stand before an assessment.",
    category: "cyber",
    status: "planned",
  },
  {
    slug: "cui-marking-generator",
    name: "CUI Marking Generator",
    summary: "Produce banner lines and designation indicator blocks for controlled unclassified information.",
    category: "cyber",
    status: "planned",
  },
  {
    slug: "stig-reference-lookup",
    name: "DISA STIG Reference Lookup",
    summary: "Search STIG rules by ID, severity or keyword without leaving the browser.",
    category: "cyber",
    status: "planned",
  },
  {
    slug: "oscal-validator",
    name: "OSCAL Validator",
    summary: "Check OSCAL catalogs, profiles and system security plans against the schema, locally.",
    category: "cyber",
    status: "planned",
  },

  // Market research & small business
  {
    slug: "naics-psc-crosswalk",
    name: "NAICS-to-PSC Crosswalk",
    summary: "Go from an industry code to the product and service codes buyers search on.",
    category: "market",
    status: "planned",
  },
  {
    slug: "ndc-eligibility-checker",
    name: "NDC Eligibility Checker",
    summary: "Check whether you count as a nontraditional defense contractor, and what that opens up.",
    category: "market",
    status: "planned",
  },
  {
    slug: "set-aside-guide",
    name: "Small Business Set-Aside Guide",
    summary: "See which set-aside programs you may qualify for and what each one requires.",
    category: "market",
    status: "planned",
  },

  // Tactical & DevSecOps
  {
    slug: "offline-manifest-inspector",
    name: "Offline Manifest Inspector",
    summary: "Read container manifests, package lockfiles and SBOMs with no network connection.",
    category: "devsecops",
    status: "planned",
  },
  {
    slug: "certificate-verifier",
    name: "Certificate Verifier",
    summary: "Decode X.509 certificates and check chains and expiry dates on your own machine.",
    category: "devsecops",
    status: "planned",
  },
  {
    slug: "air-gap-transfer-helpers",
    name: "Air-Gap Transfer Helpers",
    summary: "Checksums and transfer manifests for moving files onto a disconnected system.",
    category: "devsecops",
    status: "planned",
  },
];

export const statusLabel: Record<ToolStatus, string> = {
  planned: "Planned",
  building: "In development",
  live: "Live",
};

export function toolsIn(category: CategoryId): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export const liveCount = tools.filter((tool) => tool.status === "live").length;
