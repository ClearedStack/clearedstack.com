import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/data/site";

const navLink = "rounded-sm px-2 py-1.5 text-muted transition-colors hover:text-ink";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" aria-label="ClearedStack home" className="rounded-sm">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/tools/" className={navLink}>
            Tools
          </Link>
          <Link href="/about/" className={navLink}>
            About
          </Link>
          <a href={site.github} className={navLink} rel="noopener">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
