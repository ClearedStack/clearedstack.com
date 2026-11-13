import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why ClearedStack exists, how the project is run, and the full disclaimer: an independent, free, open-source project with no government affiliation.",
  alternates: { canonical: "/about/" },
};

function Block({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-label`}
      className="grid gap-4 border-t border-line py-12 lg:grid-cols-[14rem_minmax(0,42rem)] lg:gap-16"
    >
      <h2 id={`${id}-label`} className="font-mono text-xs uppercase tracking-[0.14em] text-accent lg:pt-1.5">
        {label}
      </h2>
      <div className="prose-cs [&>*:first-child]:mt-0">{children}</div>
    </section>
  );
}

const rules = [
  {
    title: "No revenue.",
    body: "No ads, sponsorships, affiliate links, paid tiers or donations. The project costs its users nothing and earns nothing.",
  },
  {
    title: "No data collection.",
    body: "No analytics, cookies or accounts. This site makes no third-party requests, and its content security policy tells your browser to block any that slip in. As with any website, the company hosting it can see the IP address a page was requested from.",
  },
  {
    title: "Public sources only.",
    body: "Tools are built only from material the government has officially released to the public: regulations, standards and guidance. No classified, controlled or otherwise non-public information goes into them, and a leaked document does not count as public.",
  },
  {
    title: "Show the work.",
    body: "Each tool will cite the regulation or standard behind its results, so you can check the answer instead of trusting it.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">About</p>
        <span className="font-mono text-xs text-muted">Revised {site.revised}</span>
      </div>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-5xl">
        Good engineers should not need a compliance department to bid.
      </h1>

      <div className="mt-14">
        <Block id="mission" label="Mission">
          <p>
            Selling software or services to the Department of Defense takes more than being good at the work. Before a
            small company can bid, it has to price labor the way FAR Part 31 expects, build indirect rates an auditor
            will accept, answer every instruction in Section L and every criterion in Section M, and show how it
            protects controlled unclassified information under NIST SP 800-171 and CMMC.
          </p>
          <p>
            Large contractors have whole departments for this. A one-person company has evenings. Plenty of capable
            engineers look at the pile, decide it is not worth it and take their skills somewhere else, and the
            government ends up with fewer bidders to choose from.
          </p>
          <p>
            Almost all of that knowledge is public. It sits in regulations, standards and agency guides that anyone
            can read. What costs money is turning it into a worked answer for one company’s situation, and that step
            is mostly arithmetic, lookup tables and checklists. Software is good at those.
          </p>
          <p>
            <strong>
              ClearedStack turns that step into tools and gives the tools away.
            </strong>{" "}
            The aim is that someone who can do the work can also get through the paperwork, without hiring a
            consultant first.
          </p>
        </Block>

        <Block id="how" label="How it is organized">
          <p>
            Each tool is a separate open-source project with its own repository. That keeps every tool small enough to
            audit in one sitting, and lets anyone run a copy on their own network.
          </p>
          <p>
            This site is the index. It lists what exists, what is being built and where the source lives. The{" "}
            <Link href="/tools/">catalog</Link> is generated from a single file in{" "}
            <a href={site.repo} rel="noopener">
              this site’s repository
            </a>
            , so adding a tool to the list is a one-entry pull request.
          </p>
        </Block>

        <Block id="rules" label="Ground rules">
          <ul className="grid gap-6 sm:grid-cols-2">
            {rules.map((rule) => (
              <li key={rule.title} className="border-t-2 border-ink pt-3 text-sm leading-relaxed text-muted">
                <strong className="block text-base">{rule.title}</strong>
                <span className="mt-1 block">{rule.body}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="disclaimer" label="Disclaimer">
          <p>
            <strong>ClearedStack is an independent personal project</strong>, built on personal time with personal
            equipment. It is not affiliated with, endorsed by, or sponsored by the U.S. Department of Defense, any
            military service or any other government agency. The views expressed here are the maintainers’ own. They
            do not represent the views of the Department of Defense or its components, or an official position of the
            U.S. Government.
          </p>
          <p>
            <strong>The name is only a name.</strong> ClearedStack does not grant, verify or imply a security
            clearance, a facility clearance, an authorization to operate, or a certification such as CMMC or FedRAMP.
          </p>
          <p>
            <strong>The tools are aids for your own work.</strong> They are not legal, accounting, tax or compliance
            advice, and they can be wrong or out of date. Regulations change. Check results against the current text
            of the governing regulation, and talk to a qualified professional before you rely on a number in a bid or
            sign an attestation.
          </p>
          <p>
            <strong>Keep classified information out.</strong> No tool listed here is approved for it.
          </p>
          <p>
            The software is provided under the{" "}
            <a href={`${site.repo}/blob/main/LICENSE`} rel="noopener">
              MIT License
            </a>
            , without warranty of any kind.
          </p>
        </Block>

        <Block id="contact" label="Contact">
          <p>
            Tool requests, corrections and contributions are welcome at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> or on{" "}
            <a href={site.github} rel="noopener">
              GitHub
            </a>
            . If a tool gets a regulation wrong, that is the most useful thing you can report.
          </p>
        </Block>
      </div>
    </div>
  );
}
