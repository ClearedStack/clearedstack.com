import Link from "next/link";
import { Flow } from "@/components/Diagram";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">404 · No such line item</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">That page is not in the contract.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        There is no tool, guide or page at this address.
      </p>

      <div className="mt-10 max-w-3xl">
        <Flow
          caption="Where to go from here."
          direction="across"
          steps={[
            {
              tag: "Sections B, C, F, H",
              label: "Home",
              detail: "The price schedule, the catalog, the ground rules and the roadmap.",
            },
            {
              tag: "CLIN 0001–0005",
              label: "Tools",
              detail: "Every tool, with what it does and the regulation behind it.",
            },
            {
              tag: "Section L",
              label: "Guides",
              detail: "Plain-language guides to the paperwork, and to hosting a copy.",
            },
            {
              tag: "Section J",
              label: "Platform",
              detail: "How ideas are chosen and built, and how the project is run.",
            },
          ]}
        />
      </div>

      <p className="mt-10 text-base text-muted">
        Head to the{" "}
        <Link href="/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          home page
        </Link>
        , browse the{" "}
        <Link href="/tools/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          tools
        </Link>
        , read the{" "}
        <Link href="/guides/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          guides
        </Link>
        , or see{" "}
        <Link
          href="/platform/how-we-decide/"
          className="text-ink underline decoration-accent underline-offset-4 hover:text-accent"
        >
          how we decide what to build
        </Link>
        . Guides about the project itself moved to{" "}
        <Link href="/platform/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          Platform
        </Link>
        .
      </p>
    </div>
  );
}
