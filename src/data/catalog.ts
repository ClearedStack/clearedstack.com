/**
 * The tool catalog.
 *
 * Every ClearedStack tool lives in its own repository. This file is the index
 * the website is built from. To list a tool, add an entry to `tools` below;
 * when it ships, set `status` to "live" and fill in `url` and `repo`.
 *
 * Each entry also gets its own page at /tools/<slug>/. The fields from
 * `detail` down are what that page shows; all of them are optional.
 *
 * Keep the entries plain object literals. The search index reads this file
 * as text (scripts/generate-search-index.mjs).
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
  /** Two or three sentences on what the tool does, or is planned to do. */
  detail?: string;
  /** What you bring to it. */
  inputs?: string[];
  /** What you leave with. */
  outputs?: string[];
  /** The public sources it is built from. */
  sources?: ToolSource[];
  /** Guides that explain the subject, with the section to start at. */
  guides?: ToolGuide[];
};

export type ToolSource = { name: string; url?: string };

/** `slug` is a file name in src/guides; `section` is the text of a heading in it. */
export type ToolGuide = { slug: string; section?: string };

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
    detail:
      "Enter an hourly wage and your fringe, overhead, G&A and fee rates. The tool applies each layer to the running total, shows every step, and gives the fully burdened rate and the wrap rate with and without fee. You choose the conventions, such as whether overhead is applied to labor alone or to labor plus fringe.",
    inputs: [
      "An hourly wage, or a salary and the hours to divide it by",
      "Fringe, overhead and G&A rates, and what each one is applied to",
      "A fee percentage",
    ],
    outputs: [
      "The build-up from wage to burdened rate, one layer at a time",
      "The wrap rate on cost and the wrap rate with fee",
    ],
    sources: [
      {
        name: "FAR Part 31, “Contract Cost Principles and Procedures”",
        url: "https://www.acquisition.gov/browse/index/far",
      },
    ],
    guides: [
      { slug: "labor-rates", section: "Build the rate for one hour" },
      { slug: "checking-results", section: "Work one example by hand" },
    ],
  },
  {
    slug: "indirect-rate-estimator",
    name: "Indirect Rate Estimator",
    summary: "Turn your cost pools and allocation bases into fringe, overhead and G&A rates.",
    category: "pricing",
    status: "planned",
    detail:
      "Enter your annual cost pools and the base each one is divided by. The tool works out the fringe, overhead and G&A rates, shows the division behind each, and lets you compare allocation bases, such as a total cost input base against a value-added base for G&A.",
    inputs: [
      "Direct and indirect labor dollars for the year",
      "The totals of your fringe, overhead and G&A pools",
      "The allocation base for each pool",
    ],
    outputs: [
      "Fringe, overhead and G&A rates, with the arithmetic shown",
      "The same pools on different bases, side by side",
    ],
    sources: [
      {
        name: "FAR Part 31, especially 31.201-2, 31.202 and 31.203",
        url: "https://www.acquisition.gov/browse/index/far",
      },
      { name: "FAR Subpart 42.7, “Indirect Cost Rates”" },
      { name: "DCAA, “Information for Contractors” (DCAA Manual 7641.90)", url: "https://www.dcaa.mil" },
    ],
    guides: [{ slug: "labor-rates", section: "Turn pools into rates" }],
  },
  {
    slug: "section-b-pricing-table",
    name: "Section B Pricing Table Builder",
    summary: "Lay out CLINs, quantities and extended prices the way the solicitation asks for them.",
    category: "pricing",
    status: "planned",
    detail:
      "Enter the line items, quantities, units and unit prices a solicitation asks for. The tool extends each line, applies the rounding rule you choose, escalates the option years and produces a table you can copy into the government’s own format.",
    inputs: [
      "The solicitation’s line items and labor categories",
      "Quantities or hours, and unit prices or burdened rates",
      "An escalation percentage for option years, and a rounding rule",
    ],
    outputs: ["An extended price for every line item, with totals by period", "A table to copy, or to export as CSV"],
    sources: [
      { name: "The solicitation’s own Section B and pricing instructions" },
      {
        name: "FAR Part 15, on the uniform contract format",
        url: "https://www.acquisition.gov/browse/index/far",
      },
    ],
    guides: [
      { slug: "labor-rates", section: "Lay out the price table" },
      { slug: "read-a-solicitation", section: "The lettered sections" },
    ],
  },
  {
    slug: "prompt-payment-interest",
    name: "Prompt Payment Interest Tracker",
    summary: "Work out the interest owed on a late government invoice under the Prompt Payment Act.",
    category: "pricing",
    status: "planned",
    detail:
      "Enter the invoice amount and the dates the invoice was received, the work was accepted and the payment was made. The tool finds the due date, counts the days late and works out the interest owed, including the rule that adds interest to the balance every 30 days and the additional penalty when interest goes unpaid.",
    inputs: [
      "The invoice amount",
      "The invoice receipt, acceptance and payment dates",
      "The Treasury rate for the period, which you confirm against Treasury’s table",
    ],
    outputs: [
      "The due date and the number of days late",
      "The interest owed, with each 30-day period shown",
      "The additional penalty, and the last day to demand it",
    ],
    sources: [
      { name: "Prompt Payment Act, 31 U.S.C. Chapter 39" },
      { name: "Prompt payment regulations, 5 CFR Part 1315", url: "https://www.ecfr.gov" },
      { name: "FAR Subpart 32.9 and clause 52.232-25", url: "https://www.acquisition.gov/browse/index/far" },
      {
        name: "Bureau of the Fiscal Service, Prompt Payment interest rates",
        url: "https://fiscal.treasury.gov/prompt-payment/",
      },
    ],
    guides: [{ slug: "getting-paid", section: "Work out the interest" }],
  },

  // Proposal & capture
  {
    slug: "rfp-requirement-shredder",
    name: "RFP Requirement Shredder",
    summary: "Pull every “shall”, “must” and “will” out of a solicitation into a numbered requirements list.",
    category: "proposal",
    status: "planned",
    detail:
      "Paste or open the text of a solicitation. The tool finds each sentence that binds someone, splits compound requirements into one per line, keeps the exact wording and numbers each one with the section it came from. The text is read in your browser and is not uploaded.",
    inputs: ["The text of the solicitation, its amendments and its attachments"],
    outputs: [
      "A numbered list of requirements, each with its exact text and where it came from",
      "The list as CSV, ready for a compliance matrix",
    ],
    sources: [
      { name: "The solicitation itself" },
      {
        name: "FAR Part 15 and provision 52.215-1, “Instructions to Offerors”",
        url: "https://www.acquisition.gov/browse/index/far",
      },
    ],
    guides: [{ slug: "answer-a-solicitation", section: "Pull out the requirements" }],
  },
  {
    slug: "compliance-matrix-generator",
    name: "Compliance Matrix Generator",
    summary: "Map Section L instructions and Section M criteria to the proposal sections that answer them.",
    category: "proposal",
    status: "planned",
    detail:
      "Start from a numbered list of requirements. The tool lays out a matrix with one row for each, with columns for the source, the exact text, the place in your proposal that answers it, an owner, a status and notes. It also lets you tie each Section M factor to its Section L instruction and its Section C work requirements, and shows where the three do not line up.",
    inputs: ["A numbered list of requirements", "Your proposal outline"],
    outputs: [
      "A compliance matrix to fill in and export",
      "The factors that have no matching instruction, and the reverse",
    ],
    sources: [
      { name: "The solicitation’s Sections L, M and C" },
      { name: "FAR Part 15, on instructions to offerors and evaluation factors", url: "https://www.acquisition.gov/browse/index/far" },
    ],
    guides: [{ slug: "answer-a-solicitation", section: "Build the compliance matrix" }],
  },
  {
    slug: "acronym-table-builder",
    name: "Acronym Table Builder",
    summary: "Find every acronym in a draft and produce the definition table reviewers expect.",
    category: "proposal",
    status: "planned",
    detail:
      "Paste a draft volume. The tool lists every acronym it finds, where each first appears and whether it is spelled out there. It flags acronyms that are defined and never used again, and acronyms used with two meanings. You write the definitions and the tool builds the table.",
    inputs: ["The text of a draft proposal volume"],
    outputs: [
      "An acronym table in alphabetical order",
      "The acronyms that are undefined, unused or used with two meanings",
    ],
    sources: [{ name: "The solicitation’s own instructions on acronym lists and page counts" }],
    guides: [{ slug: "answer-a-solicitation", section: "Define the acronyms" }],
  },
  {
    slug: "page-budget-planner",
    name: "Page Budget Planner",
    summary: "Split a page limit across volumes and sections by evaluation weight.",
    category: "proposal",
    status: "planned",
    detail:
      "Enter a volume’s page limit and the evaluation factors, with the working weights you read from Section M. The tool sets aside the pages you reserve for an introduction and splits the rest in proportion, so every writer knows their limit on the first day.",
    inputs: [
      "The page limit, and what counts toward it",
      "The evaluation factors and your working weight for each",
      "Pages reserved for an introduction or summary",
    ],
    outputs: ["A page allocation for each section that adds up to the limit"],
    sources: [
      { name: "The solicitation’s Sections L and M" },
      {
        name: "FAR Part 15, on evaluation factors and their relative importance",
        url: "https://www.acquisition.gov/browse/index/far",
      },
    ],
    guides: [{ slug: "answer-a-solicitation", section: "Budget the pages" }],
  },

  // Cybersecurity & compliance
  {
    slug: "nist-800-171-checklist",
    name: "NIST SP 800-171 / CMMC Readiness Checklist",
    summary: "Walk the requirements one by one, track what is implemented and see where you stand before an assessment.",
    category: "cyber",
    status: "planned",
    detail:
      "Go through the 110 requirements of NIST SP 800-171 Revision 2 one at a time, record whether each is implemented and what the evidence is, and see the score the Department of Defense assessment method would give. Your progress is kept in your browser, with a button to clear it.",
    inputs: ["Whether each requirement is implemented", "Notes on the evidence, and on the fix planned for each gap"],
    outputs: [
      "A tally of implemented requirements by family",
      "The assessment score under the DoD method",
      "The list of gaps to carry into a plan of action and milestones",
    ],
    sources: [
      { name: "NIST SP 800-171 Revision 2 and SP 800-171A", url: "https://csrc.nist.gov" },
      { name: "CMMC program rule, 32 CFR Part 170, including the scoring method at 170.24", url: "https://www.ecfr.gov" },
      { name: "DFARS 252.204-7012 and 252.204-7021", url: "https://www.acquisition.gov/dfars" },
    ],
    guides: [{ slug: "protecting-government-information", section: "Scoring an assessment" }],
  },
  {
    slug: "cui-marking-generator",
    name: "CUI Marking Generator",
    summary: "Produce banner lines and designation indicator blocks for controlled unclassified information.",
    category: "cyber",
    status: "planned",
    detail:
      "Choose a category from the CUI Registry and enter the controlling office and a point of contact. The tool produces the banner line and the designation indicator block in the form defense marking guidance shows, ready to paste into a document.",
    inputs: [
      "The CUI category, from the Registry",
      "The controlling component and office",
      "Any limited dissemination control, and a point of contact",
    ],
    outputs: ["The banner marking", "The designation indicator block for the first page"],
    sources: [
      { name: "CUI rule, 32 CFR Part 2002", url: "https://www.ecfr.gov" },
      { name: "The national CUI Registry", url: "https://www.archives.gov/cui" },
      { name: "DoD Instruction 5200.48 and the DoD CUI program’s marking guidance", url: "https://www.dodcui.mil" },
    ],
    guides: [{ slug: "protecting-government-information", section: "Marking CUI" }],
  },
  {
    slug: "stig-reference-lookup",
    name: "DISA STIG Reference Lookup",
    summary: "Search STIG rules by ID, severity or keyword without leaving the browser.",
    category: "cyber",
    status: "planned",
    detail:
      "Load a STIG file you downloaded from DISA and search its rules by Group ID, Rule ID, STIG ID, severity or keyword. Each rule shows its check text and its fix text. The file is read in your browser.",
    inputs: ["A STIG in its published XML form, downloaded from DISA"],
    outputs: [
      "The matching rules, each with its severity, check text and fix text",
      "The version and release of the file you loaded",
    ],
    sources: [
      { name: "DISA Security Technical Implementation Guides and Security Requirements Guides", url: "https://www.cyber.mil/stigs/" },
      { name: "NIST, the XCCDF specification", url: "https://csrc.nist.gov" },
    ],
    guides: [{ slug: "compliance-as-data", section: "Inside a STIG rule" }],
  },
  {
    slug: "oscal-validator",
    name: "OSCAL Validator",
    summary: "Check OSCAL catalogs, profiles and system security plans against the schema, locally.",
    category: "cyber",
    status: "planned",
    detail:
      "Open an OSCAL catalog, profile, component definition or system security plan. The tool checks that the file is well-formed and that it matches NIST’s schema for the OSCAL version named in its metadata, and lists each problem with its location. It cannot tell you whether the content describes your system accurately.",
    inputs: ["An OSCAL file"],
    outputs: ["Whether the file is well-formed and schema-valid", "Each error, with where in the file it is"],
    sources: [{ name: "NIST, the OSCAL models and schemas", url: "https://pages.nist.gov/OSCAL/" }],
    guides: [{ slug: "compliance-as-data", section: "Checking an OSCAL file" }],
  },

  // Market research & small business
  {
    slug: "naics-psc-crosswalk",
    name: "NAICS-to-PSC Crosswalk",
    summary: "Go from an industry code to the product and service codes buyers search on.",
    category: "market",
    status: "planned",
    detail:
      "Enter a NAICS code and see the product and service codes that have been used with it, or go the other way. There is no official one-to-one mapping between the two systems, so the result is a starting point for searching past awards, not an answer.",
    inputs: ["A NAICS code, or a product and service code"],
    outputs: ["The related codes, with their descriptions", "The edition and date of each code table used"],
    sources: [
      { name: "U.S. Census Bureau, North American Industry Classification System", url: "https://www.census.gov/naics/" },
      { name: "The Product and Service Code Manual", url: "https://www.acquisition.gov/psc-manual" },
      { name: "Past contract awards", url: "https://www.usaspending.gov" },
    ],
    guides: [{ slug: "codes-and-small-business", section: "Product and service codes" }],
  },
  {
    slug: "ndc-eligibility-checker",
    name: "NDC Eligibility Checker",
    summary: "Check whether you count as a nontraditional defense contractor, and what that opens up.",
    category: "market",
    status: "planned",
    detail:
      "Answer a short series of questions about your defense contract history. The tool compares the answers with the definition in 10 U.S.C. 3014 and tells you whether you appear to qualify as a nontraditional defense contractor, with the reasoning shown, and what the status is used for.",
    inputs: [
      "Whether you have performed a defense contract or subcontract subject to full Cost Accounting Standards coverage, and when",
    ],
    outputs: ["Your likely status, and the test that decided it", "What the status opens up"],
    sources: [
      { name: "10 U.S.C. 3014, “Nontraditional defense contractor”" },
      { name: "10 U.S.C. 4022, on prototype projects" },
      {
        name: "Cost Accounting Standards, 48 CFR Chapter 99, including the small business exemption at 9903.201-1",
        url: "https://www.ecfr.gov",
      },
    ],
    guides: [{ slug: "codes-and-small-business", section: "Nontraditional defense contractors" }],
  },
  {
    slug: "set-aside-guide",
    name: "Small Business Set-Aside Guide",
    summary: "See which set-aside programs you may qualify for and what each one requires.",
    category: "market",
    status: "planned",
    detail:
      "Answer questions about your company’s ownership, location, size and industry. The tool lists the set-aside programs you may be eligible for, what each one requires and how the status is established, with the regulation for each.",
    inputs: [
      "Your NAICS codes and your size under each",
      "Who owns and controls the company",
      "Where the principal office is",
    ],
    outputs: [
      "The programs that may fit, and what each requires",
      "Whether each status is self-represented or needs certification",
    ],
    sources: [
      { name: "Small business size regulations, 13 CFR Part 121", url: "https://www.ecfr.gov" },
      { name: "Program rules, 13 CFR Parts 124, 126, 127 and 128", url: "https://www.ecfr.gov" },
      { name: "FAR Part 19, “Small Business Programs”", url: "https://www.acquisition.gov/browse/index/far" },
      {
        name: "Small Business Administration, table of size standards",
        url: "https://www.sba.gov/document/support-table-size-standards",
      },
    ],
    guides: [{ slug: "codes-and-small-business", section: "The programs" }],
  },

  // Tactical & DevSecOps
  {
    slug: "offline-manifest-inspector",
    name: "Offline Manifest Inspector",
    summary: "Read container manifests, package lockfiles and SBOMs with no network connection.",
    category: "devsecops",
    status: "planned",
    detail:
      "Open a container image manifest, a package lockfile or a software bill of materials and read what is inside with no network connection: the components, their versions, their checksums and where each was resolved from. It is meant for reviewing what is about to be carried onto a closed network.",
    inputs: ["A container image manifest, a package lockfile or an SBOM"],
    outputs: [
      "The components, with their versions and checksums",
      "The packages resolved from a public registry, which would need a mirror inside",
    ],
    sources: [
      { name: "The Open Container Initiative image specification" },
      { name: "The SPDX and CycloneDX specifications", url: "https://spdx.dev" },
      { name: "NTIA, “The Minimum Elements For a Software Bill of Materials (SBOM)”, 2021" },
    ],
    guides: [
      { slug: "disconnected-networks", section: "Lockfiles" },
      { slug: "compliance-as-data", section: "What an SBOM is" },
    ],
  },
  {
    slug: "certificate-verifier",
    name: "Certificate Verifier",
    summary: "Decode X.509 certificates and check chains and expiry dates on your own machine.",
    category: "devsecops",
    status: "planned",
    detail:
      "Open a certificate file and see who it was issued to, the names it is valid for, who signed it and when it expires. Add the authorities you trust to check the chain. Everything is decoded in your browser.",
    inputs: ["A certificate file", "Optionally, the certificates of the authorities you trust"],
    outputs: [
      "The subject, the names it is valid for, the issuer and the validity dates",
      "Whether the chain verifies, and which link fails if it does not",
      "The days left before it expires",
    ],
    sources: [{ name: "RFC 5280, the X.509 certificate and certificate revocation list profile" }],
    guides: [{ slug: "disconnected-networks", section: "Reading a certificate" }],
  },
  {
    slug: "air-gap-transfer-helpers",
    name: "Air-Gap Transfer Helpers",
    summary: "Checksums and transfer manifests for moving files onto a disconnected system.",
    category: "devsecops",
    status: "planned",
    detail:
      "Choose the files you plan to move. The tool computes a SHA-256 checksum for each in your browser and writes a transfer manifest. On the other side, load the manifest and the files again to see which are unchanged, changed, missing or extra.",
    inputs: ["The files to transfer", "On the receiving side, the manifest and the files as they arrived"],
    outputs: ["A manifest of file names and SHA-256 checksums", "A report of what changed, went missing or was added"],
    sources: [{ name: "NIST FIPS 180-4, “Secure Hash Standard”", url: "https://csrc.nist.gov" }],
    guides: [{ slug: "disconnected-networks", section: "A transfer manifest" }],
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

export function findTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function categoryOf(tool: Tool): Category {
  return categories.find((category) => category.id === tool.category)!;
}

/** The tools whose page points at a given guide. */
export function toolsForGuide(guideSlug: string): Tool[] {
  return tools.filter((tool) => tool.guides?.some((guide) => guide.slug === guideSlug));
}

export const liveCount = tools.filter((tool) => tool.status === "live").length;
