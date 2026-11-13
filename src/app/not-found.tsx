import Link from "next/link";
import { Flow } from "@/components/Diagram";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">404 · No such line item</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">That page is not in the contract.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        The requested address does not correspond to an active line item, guide or specification in ClearedStack.
      </p>

      <div className="mt-10 max-w-3xl">
        <Flow
          caption="Contract navigation recovery options."
          direction="across"
          steps={[
            {
              tag: "Sections B, C, F, H",
              label: "Home",
              detail: "Pricing schedule, catalog summary, principles, and phased roadmap.",
            },
            {
              tag: "CLIN 0001–0006",
              label: "Tools & Apps",
              detail: "All browser compliance utilities and MIT platform/factory apps.",
            },
            {
              tag: "Section L",
              label: "Guides & Factory",
              detail: "Field manuals plus integrated Command, Pipeline, and Decide views.",
            },
            {
              tag: "Section M",
              label: "How we decide",
              detail: "Prior Art evaluation factors, gates, and 100-point scoring rubric.",
            },
          ]}
        />
      </div>

      <p className="mt-10 text-base text-muted">
        Head to the{" "}
        <Link href="/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          home page
        </Link>
        , browse{" "}
        <Link href="/tools/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          tools &amp; apps
        </Link>
        , explore{" "}
        <Link href="/guides/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          guides &amp; live factory views
        </Link>
        , or inspect{" "}
        <Link
          href="/guides/#how-we-decide"
          className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
        >
          how we decide what to build
        </Link>
        .
      </p>
    </div>
  );
}
