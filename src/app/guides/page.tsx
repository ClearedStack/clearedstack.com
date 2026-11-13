import type { Metadata } from "next";
import Link from "next/link";
import { GuideIndex } from "@/components/GuideIndex";
import { SectionLabel } from "@/components/SectionLabel";
import { site } from "@/data/site";
import { guideGroups, listGuides, type Guide } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Guides to ClearedStack and the work behind it: using the tools, checking a result, reading a solicitation, pricing labor, protecting CUI, getting paid, contributing and hosting your own copy.",
  alternates: { canonical: "/guides/" },
};

/** Reading routes through the guides, for readers who arrive with one question. */
const routes = [
  {
    title: "New to the site",
    body: "What ClearedStack is, where your information goes and how far to trust a result.",
    slugs: ["getting-started", "your-data", "checking-results", "faq"],
  },
  {
    title: "New to government contracting",
    body: "The shape of a solicitation, then the three things a first bid has to get right.",
    slugs: [
      "read-a-solicitation",
      "answer-a-solicitation",
      "labor-rates",
      "protecting-government-information",
      "codes-and-small-business",
    ],
  },
  {
    title: "Running your own copy",
    body: "For a company intranet, a lab or a network that cannot reach the internet.",
    slugs: ["host-with-docker", "host-on-kubernetes", "host-static-files", "closed-networks"],
  },
  {
    title: "Building or fixing something",
    body: "From a one-line correction to a tool of your own in the catalog.",
    slugs: ["request-or-add-a-tool", "build-a-tool", "work-on-this-site"],
  },
];

const answers = [
  {
    question: "Do I need an account?",
    answer: "No. There are no accounts on this site or on any tool it lists, and there is nothing to install.",
    slug: "getting-started",
  },
  {
    question: "Where does what I type go?",
    answer:
      "Nowhere. A tool is only listed if the work happens in your browser, and you can confirm that yourself in about a minute.",
    slug: "your-data",
  },
  {
    question: "Can I put a tool’s number straight into a bid?",
    answer:
      "Check it first. Every tool has to name the regulation behind its result, and the current text of that regulation wins over the tool.",
    slug: "checking-results",
  },
  {
    question: "Can I enter CUI or proprietary rates?",
    answer:
      "A browser tab does not change the rules for the computer it runs on. Use controlled information only on a system your contract and your company allow, and never enter classified information.",
    slug: "your-data",
  },
  {
    question: "Will it work on a network with no internet?",
    answer: "Yes. The site loads everything from itself, so a copy you host keeps working with no outside connection.",
    slug: "closed-networks",
  },
  {
    question: "Why is nothing live yet?",
    answer:
      "The catalog is published before the tools so that people can say which ones they need first. Each tool is linked the day it works.",
    slug: "faq",
  },
];

const inlineLink = "text-ink underline decoration-accent underline-offset-4 transition-colors hover:text-accent";

export default async function GuidesPage() {
  const guides = await listGuides();
  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  const find = (slug: string): Guide => {
    const guide = bySlug.get(slug);
    if (!guide) throw new Error(`The guides page links to "${slug}", which is not in src/guides.`);
    return guide;
  };

  const minutes = guides.reduce((total, guide) => total + guide.minutes, 0);
  const facts = [
    { value: String(guides.length), label: "guides" },
    { value: String(guideGroups.length), label: "sections" },
    { value: `${Math.floor(minutes / 60)} h ${minutes % 60} min`, label: "to read them all" },
    { value: "$0.00", label: "and no sign-up" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 lg:pt-20">
      {/* Introduction */}
      <SectionLabel section="Section L">Instructions to offerors</SectionLabel>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-end lg:gap-16">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl">
            Guides to the tools, and to the work behind them.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            How to use ClearedStack and check what it tells you, plain-language background on pricing, proposals and
            protecting government information, and full instructions for running your own copy.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4 lg:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse bg-surface px-4 py-3.5">
              <dt className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{fact.label}</dt>
              <dd className="font-mono text-xl font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Reading routes */}
      <section aria-labelledby="routes-title" className="mt-14 border-t border-line pt-10">
        <SectionLabel>Where to begin</SectionLabel>
        <h2 id="routes-title" className="mt-3 text-2xl font-semibold tracking-[-0.015em]">
          Pick the route that matches why you are here.
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {routes.map((route) => (
            <div key={route.title} className="flex flex-col bg-surface p-5">
              <h3 className="text-lg font-semibold">{route.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{route.body}</p>
              <ol className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
                {route.slugs.map(find).map((guide, index) => (
                  <li key={guide.slug} className="grid grid-cols-[1.5rem_1fr] items-baseline">
                    <span className="font-mono text-xs text-accent">{index + 1}</span>
                    <Link
                      href={`/guides/${guide.slug}/`}
                      className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                    >
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Every guide, by section */}
      <section aria-labelledby="all-title" className="mt-16 border-t border-line pt-10">
        <SectionLabel>All guides</SectionLabel>
        <h2 id="all-title" className="mt-3 text-2xl font-semibold tracking-[-0.015em]">
          Everything, in reading order.
        </h2>
        <div className="mt-8">
          <GuideIndex
            groups={guideGroups}
            guides={guides.map((guide) => ({
              slug: guide.slug,
              code: guide.code,
              title: guide.title,
              summary: guide.summary,
              group: guide.group,
              minutes: guide.minutes,
              // "Sources" closes every field guide, so it says nothing in a list.
              topics: guide.headings.map((heading) => heading.text).filter((text) => text !== "Sources"),
            }))}
          />
        </div>
      </section>

      {/* Short answers */}
      <section
        aria-labelledby="answers-title"
        className="mt-16 grid gap-x-16 gap-y-6 border-t border-line pt-10 lg:grid-cols-[14rem_minmax(0,1fr)]"
      >
        <div>
          <SectionLabel>Short answers</SectionLabel>
          <h2 id="answers-title" className="mt-3 text-2xl font-semibold tracking-[-0.015em]">
            Six questions people ask first.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            More in{" "}
            <Link href="/guides/faq/" className={inlineLink}>
              {find("faq").title}
            </Link>
            .
          </p>
        </div>
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {answers.map((item) => (
            <div key={item.question} className="border-t-2 border-ink pt-4">
              <dt className="text-lg font-semibold leading-snug">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {item.answer}{" "}
                <Link href={`/guides/${item.slug}/`} className={inlineLink}>
                  {find(item.slug).title}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* What the guides are not */}
      <section className="mt-16 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <SectionLabel>Before you rely on a guide</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            The field guides explain public rules in plain language. They are not legal, accounting or compliance
            advice, and rules change. Each one names its sources and the month it was last checked. When a guide and
            the current text of a regulation disagree, the regulation wins, and{" "}
            <Link href="/guides/public-sources/" className={inlineLink}>
              {find("public-sources").title}
            </Link>{" "}
            shows where to read it.
          </p>
        </div>
        <div>
          <SectionLabel>Missing or wrong</SectionLabel>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            If a guide is unclear, out of date or does not exist yet, say so. Open an issue on{" "}
            <a href={`${site.repo}/issues`} rel="noopener" className={inlineLink}>
              GitHub
            </a>{" "}
            or write to{" "}
            <a href={`mailto:${site.email}`} className={inlineLink}>
              {site.email}
            </a>
            . Every guide is a text file in the repository, so a correction can also be a pull request.
          </p>
        </div>
      </section>
    </div>
  );
}
