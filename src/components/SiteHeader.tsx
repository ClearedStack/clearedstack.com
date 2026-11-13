import Link from "next/link";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Logo } from "@/components/Logo";
import { site } from "@/data/site";

const navLink = "rounded-sm px-2 py-1.5 text-muted transition-colors hover:text-ink whitespace-nowrap";

/**
 * On a phone the header is two rows: the logo and search, then the links
 * spread across the full width. From the `sm` width up it is one row.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-5 pb-1.5 pt-3 sm:h-16 sm:flex-nowrap sm:gap-x-4 sm:py-0">
        <Link href="/" aria-label="ClearedStack home" className="mr-auto shrink-0 rounded-sm">
          <Logo />
        </Link>
        <GlobalSearch />
        <nav
          aria-label="Main"
          className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between text-sm sm:mx-0 sm:w-auto sm:justify-start sm:gap-2"
        >
          <Link href="/tools/" className={navLink}>
            Tools
          </Link>
          <Link href="/guides/" className={navLink}>
            Guides
          </Link>
          <Link href="/platform/" className={navLink}>
            Platform
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
