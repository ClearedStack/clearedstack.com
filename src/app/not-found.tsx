import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-24">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">404 · No such line item</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">That page is not in the contract.</h1>
      <p className="mt-4 text-lg text-muted">
        Head back to the{" "}
        <Link href="/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          home page
        </Link>{" "}
        or browse the{" "}
        <Link href="/tools/" className="text-ink underline decoration-accent underline-offset-4 hover:text-accent">
          tools
        </Link>
        .
      </p>
    </div>
  );
}
